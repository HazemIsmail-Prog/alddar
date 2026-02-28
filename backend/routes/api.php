<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\UserController;
use App\Http\Controllers\PermissionController;
use App\Http\Controllers\RoleController;

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
});
