<?php

use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\SettingController;
use App\Http\Controllers\NotificationLogController;

// --- Public Routes ---
Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

// --- Protected Routes ---
Route::middleware('auth:sanctum')->group(function () {

    // Profile
    Route::get('/profile', [ProfileController::class, 'show']);
    Route::post('/profile', [ProfileController::class, 'update']);

    // Student
    Route::get('/user-application', [ApplicationController::class, 'getUserApplication']);
    Route::post('/applications', [ApplicationController::class, 'store']);

    // Admin
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::post('/applications/send-convocations', [ApplicationController::class, 'sendConvocations']);
    Route::post('/applications/save-convocation-status', [ApplicationController::class, 'saveConvocationStatus']);
    Route::put('/applications/bulk-status', [ApplicationController::class, 'bulkUpdateStatus']);
    Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

    // Settings
    Route::get('/settings/main-list-count', [SettingController::class, 'getMainListCount']);
    Route::put('/settings/main-list-count', [SettingController::class, 'updateMainListCount']);

    // Notifications — check-all AVANT {id} pour éviter le conflit
    Route::get('/notification-logs', [NotificationLogController::class, 'index']);
    Route::post('/notification-logs', [NotificationLogController::class, 'store']);
    Route::put('/notification-logs/check-all', [NotificationLogController::class, 'checkAll']);
    Route::put('/notification-logs/{id}/check', [NotificationLogController::class, 'toggleCheck']);
    Route::delete('/notification-logs/clear', [NotificationLogController::class, 'clear']);
});