<?php

namespace App\Http\Controllers;

use App\Models\Application;
use App\Services\NotificationService; 
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
        $oldStatus = $application->status;
        
        $application->update(['status' => $request->status]);

        if ($oldStatus !== $request->status) {
            if ($request->status === 'accepted') {
                $type = 'to_main';
                $detail = "{$application->full_name} — Accepté (Liste Principale)";
            } elseif ($request->status === 'rejected') {
                $type = 'removed';
                $detail = "{$application->full_name} — Refusé";
            } else {
                $type = 'to_wait';
                $detail = "{$application->full_name} — Mis en attente";
            }

            NotificationService::notifySecretaries($type, $application->full_name, $detail);
        }

        return response()->json($application);
    }

    public function bulkUpdateStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'exists:applications,id',
            'status' => 'required|in:accepted,rejected,pending',
        ]);

        $applications = Application::whereIn('id', $request->ids)->get();
        
        foreach ($applications as $application) {
            $oldStatus = $application->status;
            $application->update(['status' => $request->status]);
            
            if ($oldStatus !== $request->status) {
                if ($request->status === 'accepted') {
                    $type = 'to_main';
                    $detail = "{$application->full_name} — Accepté (Liste Principale)";
                } elseif ($request->status === 'rejected') {
                    $type = 'removed';
                    $detail = "{$application->full_name} — Refusé";
                } else {
                    $type = 'to_wait';
                    $detail = "{$application->full_name} — Mis en attente";
                }

                NotificationService::notifySecretaries($type, $application->full_name, $detail);
            }
        }

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
            
            $student->convocation_sent = true;
            $student->save();

            NotificationService::notifySecretaries(
                'convocation',
                $student->full_name,
                "{$student->full_name} — Convocation envoyée"
            );
        }

        return response()->json([
            'message' => 'Convocations envoyées avec succès',
            'count' => count($students)
        ]);
    }

    public function saveConvocationStatus(Request $request)
    {
        $request->validate([
            'ids' => 'required|array',
            'ids.*' => 'integer|exists:applications,id'
        ]);

        Application::whereIn('id', $request->ids)
            ->update(['convocation_sent' => true]);

        return response()->json([
            'message' => 'Statut des convocations enregistré',
            'count' => count($request->ids)
        ]);
    }

    public function getChangeHistory(Request $request)
    {
        return response()->json([
            'message' => 'Utilisez le stockage local pour l\'historique'
        ]);
    }
}