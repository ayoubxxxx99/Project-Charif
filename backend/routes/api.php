<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Protected Routes (Require Token) ---
Route::middleware('auth:sanctum')->group(function () {

    // Students use this to submit
    Route::post('/applications', [ApplicationController::class, 'store']);

    // Admin uses these to manage
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

    // Get current user info
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
}); ?>

