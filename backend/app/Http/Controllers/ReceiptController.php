<?php

namespace App\Http\Controllers;

use App\Models\Application;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReceiptController extends Controller
{
    public function download(Request $request)
    {
        $user = $request->user();
        
        $application = Application::where('user_id', $user->id)->firstOrFail();

        $grades = [
            $application->maths,
            $application->physique,
            $application->langue_etrangere,
            $application->langue_secondaire,
            $application->histoire_geo,
            $application->education_islamique,
            $application->sport,
        ];
        
        $total = array_sum(array_map('floatval', $grades));
        $moyenne = number_format($total / 7, 2);

        $data = [
            'name' => $application->full_name,
            'massar_code' => $application->massar_code,
            'email' => $user->email,
            'date_submission' => \Carbon\Carbon::parse($application->created_at)
                ->locale('fr')
                ->isoFormat('dddd D MMMM YYYY'),
            'maths' => $application->maths,
            'physique' => $application->physique,
            'langue_etrangere' => $application->langue_etrangere,
            'langue_secondaire' => $application->langue_secondaire,
            'histoire_geo' => $application->histoire_geo,
            'education_islamique' => $application->education_islamique,
            'sport' => $application->sport,
            'moyenne' => $moyenne,
            'date_generation' => now()->format('d/m/Y'),
        ];

        $pdf = Pdf::loadView('pdf.receipt', $data);
        
        return $pdf->download("recu-candidature-{$application->massar_code}.pdf");
    }
}