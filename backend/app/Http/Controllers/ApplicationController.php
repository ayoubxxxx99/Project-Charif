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
        // 1. Validation
        $validated = $request->validate([
            'full_name' => 'required|string|max:255',
            'massar_code' => 'required|string|unique:applications',
            'last_year_grade' => 'required|numeric|between:0,20',
        ]);

        // 2. Create the record
        // This now works because Application is imported at the top!
        $application = Application::create($validated);

        // 3. Return JSON for React
        return response()->json([
            'message' => 'Application submitted successfully!',
            'data' => $application
        ], 201);
    }



    public function index()
{
    // Fetch all applications, newest first
    $applications = Application::orderBy('created_at', 'desc')->get();

    return response()->json($applications);
}



}
