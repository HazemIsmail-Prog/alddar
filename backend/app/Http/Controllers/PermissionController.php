<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Permission;
class PermissionController extends Controller
{
    public function index(Request $request)
    {
        $permissions = Permission::query()
            ->when($request->search, function ($query) use ($request) {
                $query->whereAny([
                    'name',
                    'group',
                ],'like','%'.$request->search.'%');
            })
            ->orderBy('id', 'desc')
            ->paginate(30);
        return response()->json($permissions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'group' => 'required|string|max:255',
        ]);
        $permission = Permission::create($validated);
        return response()->json($permission, 201);
    }

    public function update(Request $request, Permission $permission)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'group' => 'required|string|max:255',
        ]);
        $permission->update($validated);
        return response()->json($permission, 200);
    }

    public function destroy(Permission $permission)
    {
        $permission->delete();
        return response()->json(['message' => 'Permission deleted successfully'], 200);
    }
}
