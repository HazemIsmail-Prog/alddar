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
        $startDate = Carbon::create($year, $month, 1)->startOfMonth()->format('Y-m-d');
        $endDate = Carbon::create($year, $month, 1)->endOfMonth()->format('Y-m-d');
        $attendances = Attendance::query()
            ->with( 'user')
            ->whereDate('date', '>=', $startDate)
            ->whereDate('date', '<=', $endDate)
            ->paginate(100000);
        return response()->json($attendances);
    }

    public function store(Request $request)
    {
        sleep(3);
        $validated = $request->validate([
            'allowed_area_id' => 'required|exists:allowed_areas,id',
            'latitude' => 'required|numeric|min:-90|max:90',
            'longitude' => 'required|numeric|min:-180|max:180',
            'status' => 'required|string|max:255',
        ]);
        $validated['user_id'] = $request->user()->id;
        $validated['date'] = Carbon::now()->format('Y-m-d');
        $validated['time'] = Carbon::now()->format('H:i:s');
        $attendance = Attendance::create($validated);
        return response()->json($attendance, 201);
    }

    public function getAllowedAreas(Request $request)
    {
        $userTodaysActivities = Attendance::query()
        ->where('user_id', $request->user()->id)
        ->whereDate('date', Carbon::now()->format('Y-m-d'))
        ->get();


        $allowedAreas = AllowedArea::query()
        ->where('is_active', true)
        ->get();
        return response()->json([
            'allowedAreas' => $allowedAreas, 
            'userTodaysActivities' => $userTodaysActivities,
        ], 200);
    }
}
