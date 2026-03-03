<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Illuminate\Http\Request;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Support\Facades\Mail;


class ApplicationController extends Controller
{
   public function store(Request $request)
{
    // 1. Validate inputs
    $validated = $request->validate([
        'full_name' => 'required|string|max:255',
        'massar_code' => 'required|string|unique:applications,massar_code',
        'maths' => 'required|numeric|between:0,20',
        'physique' => 'required|numeric|between:0,20',
        'langue_etrangere' => 'required|numeric|between:0,20',
        'langue_secondaire' => 'required|numeric|between:0,20',
        'histoire_geo' => 'required|numeric|between:0,20',
        'education_islamique' => 'required|numeric|between:0,20',
        'sport' => 'required|numeric|between:0,20',
    ]);

    // 2. IMPORTANT: Link the application to the logged-in user
    // Make sure 'user_id' is in the $fillable array of your Application Model!
    $validated['user_id'] = $request->user()->id;
    $validated['email'] = $request->user()->email;
    $validated['status'] = 'pending';

    // 3. Create the record
    $application = Application::create($validated);

    return response()->json([
        'message' => 'Candidature enregistrée !',
        'data' => $application
    ], 201);
}

public function getUserApplication(Request $request)
{
    // Get the authenticated student via Sanctum
    $user = $request->user();

    // Find application by user_id
    $application = Application::where('user_id', $user->id)->first();

    // If no application, return null (200 OK) so React shows the form
    if (!$application) {
        return response()->json(null, 200);
    }

    return response()->json($application);
}

    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|in:accepted,rejected,pending',
        ]);

        $application = Application::findOrFail($id);
        $application->update(['status' => $request->status]);

        return response()->json($application);
    }

    // --- YOUR BULK METHOD ---
    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:applications,id',
            'status' => 'required|in:accepted,rejected,pending',
        ]);

        Application::whereIn('id', $request->ids)->update([
            'status' => $request->status
        ]);

        return response()->json(['message' => 'Applications updated successfully']);
    }

    public function index()
    {
        return response()->json(Application::orderBy('created_at', 'desc')->get());
    }

    public function sendConvocations(Request $request)
{
    $request->validate([
        'ids' => 'required|array',
        'date' => 'required|date',
        'time' => 'required'
    ]);

    // Fetch the selected students
    $students = Application::whereIn('id', $request->ids)->get();

    foreach ($students as $student) {
        // 1. Prepare data for the PDF
        $data = [
            'name' => $student->full_name,
            'date' => $request->date,
            'time' => $request->time,
        ];

        // 2. Generate PDF
        $pdf = Pdf::loadView('emails.convocation_pdf', $data);

        // 3. Send Email
        Mail::send([], [], function ($message) use ($student, $pdf) {
            $message->to($student->email) // Make sure your DB has an email column!
                ->subject('Convocation Officielle - Lycée Charif Idrissi')
                ->html("Bonjour {$student->full_name}, <br><br> Félicitations ! Votre candidature est acceptée. Veuillez trouver votre convocation en pièce jointe.")
                ->attachData($pdf->output(), "convocation_{$student->massar_code}.pdf");
        });
    }

    return response()->json(['message' => 'Convocations envoyées avec succès']);
}

}
