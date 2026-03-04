<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Attendance;
use Carbon\Carbon;
use App\Models\AllowedArea;
class AttendanceController extends Controller
{
    public function index(Request $request)
    {
        if(!$request->user()->hasPermission('view attendances')) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }
        $month = $request->month ?? date('m');
        $year = $request->year ?? date('Y');
        $startDate = Carbon::create($year, $month, 1)->startOfMonth();
        $endDate = Carbon::create($year, $month, 1)->endOfMonth();
        $attendances = Attendance::query()
            ->with('allowedArea', 'user')
            ->whereDate('created_at', '>=', $startDate)
            ->whereDate('created_at', '<=', $endDate)
            ->paginate(100000);
        return response()->json($attendances);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'allowed_area_id' => 'required|exists:allowed_areas,id',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'status' => 'required|string|max:255',
        ]);
        $validated['user_id'] = $request->user()->id;
        $attendance = Attendance::create($validated);
        return response()->json($attendance, 201);
    }

    public function update(Request $request, Attendance $attendance)
    {
        $validated = $request->validate([
            'allowed_area_id' => 'required|exists:allowed_areas,id',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'status' => 'required|string|max:255',
        ]);
        $attendance->update($validated);
        return response()->json($attendance, 200);
    }

    public function destroy(Attendance $attendance)
    {
        $attendance->delete();
        return response()->json(['message' => 'Attendance deleted successfully'], 200);
    }

    public function getAllowedAreas()
    {
        $allowedAreas = AllowedArea::query()
        ->where('is_active', true)
        ->get();
        return response()->json($allowedAreas, 200);
    }
}
