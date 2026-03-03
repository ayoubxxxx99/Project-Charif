<?php

namespace App\Http\Controllers;

// 1. Imports must go ABOVE the class
use App\Models\Application;
use Illuminate\Http\Request;

class ApplicationController extends Controller
{
    // 2. Do NOT put "use App\Models..." here.
    // This area is only for the methods (functions).

    public function store(Request $request)
    {
        $validated = $request->validate([
        'full_name' => 'required|string|max:255',
        'massar_code' => 'required|string|unique:applications',
        'maths' => 'required|numeric|between:0,20',
        'physique' => 'required|numeric|between:0,20',
        'langue_etrangere' => 'required|numeric|between:0,20',
        'langue_secondaire' => 'required|numeric|between:0,20',
        'histoire_geo' => 'required|numeric|between:0,20',
        'education_islamique' => 'required|numeric|between:0,20',
        'sport' => 'required|numeric|between:0,20',
    ]);

    // Add default status
    $validated['status'] = 'pending';

    $application = Application::create($validated);

    return response()->json($application, 201);
    }



    public function index()
{
    // Fetch all applications, newest first
    $applications = Application::orderBy('created_at', 'desc')->get();

    return response()->json($applications);
}



}
