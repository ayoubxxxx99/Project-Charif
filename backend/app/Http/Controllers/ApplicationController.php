<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Services\NotificationService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Mail;
use App\Mail\ConvocationMail;

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
            'ids.*' => 'exists:applications,id',
            'date' => 'required|date',
            'time' => 'required'
        ]);

        $students = Application::whereIn('id', $request->ids)->get();

        foreach ($students as $student) {
            try {
                Mail::to($student->email)->send(new ConvocationMail($student, $request->date, $request->time));

                $student->update(['convocation_sent' => true]);

                NotificationService::notifySecretaries(
                    'convocation',
                    $student->full_name,
                    "{$student->full_name} — Convocation envoyée"
                );

            } catch (\Exception $e) {
                \Log::error('Erreur envoi convocation: ' . $e->getMessage());
                return response()->json([
                    'error' => 'Erreur lors de l\'envoi: ' . $e->getMessage()
                ], 500);
            }
        } 
        // 1. Générer le PDF (document à imprimer)
        //$pdf = Pdf::loadView('emails.convocation_pdf', $data);

        // 2. Envoyer l'email HTML + PDF joint
       // Mail::send('emails.convocation_email', $data, function ($message) use ($student, $pdf) {
         //   $message->to($student->email)
           //     ->subject('Convocation — Dépôt des documents | Lycée Charif Idrissi')
             //   ->attachData($pdf->output(), "convocation_{$student->massar_code}.pdf");
        //});
        
        //$student->convocation_sent = true;
        //$student->save();Mail::to($student->email)->send(new ConvocationMail($student, $request->date, $request->time));


        return response()->json([
            'message' => 'Convocations envoyées avec succès',
            'count' => count($students)
        ]);
    }
}