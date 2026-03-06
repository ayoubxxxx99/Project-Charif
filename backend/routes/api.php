<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Protected Routes (Require Token) ---
Route::middleware('auth:sanctum')->group(function () {
Route::get('/profile', [ProfileController::class, 'show']);
Route::post('/profile', [ProfileController::class, 'update']);
    // --- Student Specific ---
    Route::get('/user-application', [ApplicationController::class, 'getUserApplication']);
    Route::post('/applications', [ApplicationController::class, 'store']);

    // --- Admin Management ---
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications/send-convocations', [ApplicationController::class, 'sendConvocations']);
    Route::put('/applications/bulk-status', [ApplicationController::class, 'bulkUpdateStatus']);
    Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);
}); ?>

