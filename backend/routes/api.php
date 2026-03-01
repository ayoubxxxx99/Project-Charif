<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\ApplicationController;
Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');



//  http://127.0.0.1:8000/api/apply
Route::post('/apply', [ApplicationController::class, 'store']);
Route::get('/applications', [ApplicationController::class, 'index']);
