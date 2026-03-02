<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApplicationController;
use App\Http\Controllers\AuthController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



//  http://127.0.0.1:8000/api/apply
Route::post('/apply', [ApplicationController::class, 'store']);
Route::get('/applications', [ApplicationController::class, 'index']);
  Route::post('/register', [AuthController::class, 'register']);

Route::post('/login', [AuthController::class, 'login']);

// Protected Routes (khass ykun endk token)
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/applications', [ApplicationController::class, 'index']);
    Route::put('/applications/{id}/status', [ApplicationController::class, 'updateStatus']);

});
