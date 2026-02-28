<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Role;
use App\Models\Permission;

class RoleController extends Controller
{
    public function index(Request $request)
    {
        $roles = Role::query()
            ->with('permissions')
            ->when($request->search, function ($query) use ($request) {
                $query->whereAny([
                    'name',
                ],'like','%'.$request->search.'%');
            })
            ->orderBy('id', 'desc')
            ->paginate(30);
        return response()->json($roles);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permission_ids' => 'nullable|array|exclude',
            'permission_ids.*' => 'exists:permissions,id',
        ]);
        $role = Role::create($validated);
        $role->permissions()->sync($request->permission_ids);
        return response()->json($role->load('permissions'), 201);
    }

    public function update(Request $request, Role $role)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'permission_ids' => 'nullable|array|exclude',
            'permission_ids.*' => 'exists:permissions,id',
        ]);
        $role->update($validated);
        $role->permissions()->sync($request->permission_ids);
        $role->users()->each(function ($user) {
            $user->tokens()->delete();
        });
        return response()->json($role->load('permissions'), 200);
    }

    public function destroy(Role $role)
    {
        $role->delete();
        return response()->json(['message' => 'Role deleted successfully'], 200);
    }

    public function getRelatedLists()
    {
        $permissions = Permission::all();
        return response()->json([
            'permissions' => $permissions,
        ]);
    }
}
