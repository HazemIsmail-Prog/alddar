<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;
use App\Http\Controllers\AllowedAreaController;
use App\Http\Controllers\AttendanceController;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/logout', [AuthController::class, 'logout']);

    // users
    Route::get('/users/getRelatedLists', [UserController::class, 'getRelatedLists']);
    Route::apiResource('/users', UserController::class)->except(['show']);
    
    // permissions
    Route::apiResource('/permissions', PermissionController::class)->except(['show']);

    // roles
    Route::get('/roles/getRelatedLists', [RoleController::class, 'getRelatedLists']);
    Route::apiResource('/roles', RoleController::class)->except(['show']);

    // allowed areas
    Route::apiResource('/allowed-areas', AllowedAreaController::class)->except(['show']);

    // attendances
    Route::get('/attendances/getAllowedAreas', [AttendanceController::class, 'getAllowedAreas']);
    Route::apiResource('/attendances', AttendanceController::class)->except(['show', 'update', 'destroy']);
});
