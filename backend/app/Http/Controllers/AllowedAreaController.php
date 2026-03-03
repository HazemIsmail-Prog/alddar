<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\AllowedArea;

class AllowedAreaController extends Controller
{
    public function index()
    {
        $allowedAreas = AllowedArea::query()
        ->paginate(10);
        return response()->json($allowedAreas);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'polygon' => 'nullable|array|min:3',
            'polygon.*.lat' => 'required_with:polygon|numeric|min:-90|max:90',
            'polygon.*.lng' => 'required_with:polygon|numeric|min:-180|max:180',
            'is_active' => 'required|boolean',
        ]);
        $allowedArea = AllowedArea::create($validated);
        return response()->json($allowedArea, 201);
    }

    public function update(Request $request, AllowedArea $allowedArea)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'polygon' => 'nullable|array|min:3',
            'polygon.*.lat' => 'required_with:polygon|numeric|min:-90|max:90',
            'polygon.*.lng' => 'required_with:polygon|numeric|min:-180|max:180',
            'is_active' => 'required|boolean',
        ]);
        $allowedArea->update($validated);
        return response()->json($allowedArea, 200);
    }

    public function destroy(AllowedArea $allowedArea)
    {
        $allowedArea->delete();
        return response()->json(['message' => 'Allowed area deleted successfully'], 200);
    }
}
