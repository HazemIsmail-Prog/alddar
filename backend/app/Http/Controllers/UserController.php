<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\User;
use App\Models\Permission;
use App\Models\Role;
class UserController extends Controller
{
    public function index(Request $request)
    {
        if (!$request->user()->hasPermission('view users')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $users = User::query()
            ->with('permissions', 'roles')
            ->when($request->search, function ($query) use ($request) {
                $query->whereAny([
                    'name',
                    'email',
                ],'like','%'.$request->search.'%');
            })
            ->orderBy('id', 'desc')
            ->paginate(30);
        return response()->json($users);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users',
            'password' => 'required|string|min:8',
            'permission_ids' => 'nullable|array|exclude',
            'permission_ids.*' => 'exists:permissions,id',
            'role_ids' => 'nullable|array|exclude',
            'role_ids.*' => 'exists:roles,id',
        ]);
        $user = User::create($validated);
        $user->permissions()->sync($request->permission_ids);
        $user->roles()->sync($request->role_ids);
        return response()->json($user->load('permissions', 'roles'), 201);
    }

    public function update(Request $request, User $user)
    {
        return response()->json($request->all());
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email,'.$user->id,
            'password' => 'nullable|string|min:8|exclude',
            'permission_ids' => 'nullable|array|exclude',
            'permission_ids.*' => 'exists:permissions,id',
            'role_ids' => 'nullable|array|exclude',
            'role_ids.*' => 'exists:roles,id',
        ]);
        if ($request->has('password')) {
            $validated['password'] = bcrypt($request->password);
        }
        $user->update($validated);
        $user->permissions()->sync($request->permission_ids);
        $user->roles()->sync($request->role_ids);
        $user->tokens()->delete();
        return response()->json($user->load('permissions', 'roles'), 200);
    }

    public function destroy(User $user)
    {
        $user->delete();
        return response()->json(['message' => 'User deleted successfully'], 200);
    }

    public function getRelatedLists()
    {
        $permissions = Permission::all();
        $roles = Role::all();
        return response()->json([
            'permissions' => $permissions,
            'roles' => $roles,
        ]);
    }
}
