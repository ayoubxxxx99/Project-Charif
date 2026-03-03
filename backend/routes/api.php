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
   // --- Protected Routes (Require Token) ---
Route::middleware('auth:sanctum')->group(function () {
Route::post('/applications/send-convocations', [ApplicationController::class, 'sendConvocations']);
    // 1. Specific/Static routes go FIRST
    Route::put('/applications/bulk-status', [ApplicationController::class, 'bulkUpdateStatus']);

    // 2. Dynamic routes (with {id}) go SECOND
    Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

    // ... rest of your routes
    Route::post('/applications', [ApplicationController::class, 'store']);
    Route::get('/applications', [ApplicationController::class, 'index']);
});
}); ?>

