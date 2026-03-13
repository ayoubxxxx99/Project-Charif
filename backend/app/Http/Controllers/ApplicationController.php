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

    $validated['user_id'] = $request->user()->id;
    $validated['email'] = $request->user()->email;
    $validated['status'] = 'pending';

    $application = Application::create($validated);

    return response()->json([
        'message' => 'Candidature enregistrée !',
        'data' => $application
    ], 201);
}

public function getUserApplication(Request $request)
{
    $user = $request->user();
    $application = Application::where('user_id', $user->id)->first();

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

    $students = Application::whereIn('id', $request->ids)->get();

    foreach ($students as $student) {
        $data = [
            'name' => $student->full_name,
            'date' => $request->date,
            'time' => $request->time,
        ];

        $pdf = Pdf::loadView('emails.convocation_pdf', $data);

        Mail::send([], [], function ($message) use ($student, $pdf) {
            $message->to($student->email)
                ->subject('Convocation Officielle - Lycée Charif Idrissi')
                ->html("Bonjour {$student->full_name}, <br><br> Félicitations ! Votre candidature est acceptée. Veuillez trouver votre convocation en pièce jointe.")
                ->attachData($pdf->output(), "convocation_{$student->massar_code}.pdf");
        });

        sleep(1);
    }

    return response()->json(['message' => 'Convocations envoyées avec succès']);
}

}
