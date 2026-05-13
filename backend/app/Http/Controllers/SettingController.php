<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use App\Models\Application;
use App\Services\NotificationService;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getMainListCount()
    {
        $countSetting = Setting::where('key', 'main_list_count')->first();
        $idsSetting = Setting::where('key', 'main_list_ids')->first();

        return response()->json([
            'main_list_count' => $countSetting ? (int) $countSetting->value : 0,
            'main_list_ids' => $idsSetting ? json_decode($idsSetting->value, true) : []
        ]);
    }

    public function updateMainListCount(Request $request)
    {
        $request->validate([
            'main_list_count' => 'required|integer|min:0',
            'main_list_ids' => 'nullable|array',
            'main_list_ids.*' => 'integer|exists:applications,id'
        ]);

        // Anciens IDs avant modification
        $oldIdsSetting = Setting::where('key', 'main_list_ids')->first();
        $oldIds = $oldIdsSetting ? json_decode($oldIdsSetting->value, true) : [];
        $newIds = $request->main_list_ids ?? [];

        // Met à jour le count
        Setting::updateOrCreate(
            ['key' => 'main_list_count'],
            ['value' => $request->main_list_count]
        );

        // Met à jour les IDs
        Setting::updateOrCreate(
            ['key' => 'main_list_ids'],
            ['value' => json_encode($newIds)]
        );

        // 🔥 Notif : étudiants ajoutés à la liste principale
        $addedIds = array_diff($newIds, $oldIds);
        foreach ($addedIds as $id) {
            $student = Application::find($id);
            if ($student) {
                NotificationService::notifySecretaries(
                    'to_main',
                    $student->full_name,
                    "{$student->full_name} — Ajouté à la Liste Principale"
                );
            }
        }

        // 🔥 Notif : étudiants retirés de la liste principale
        $removedIds = array_diff($oldIds, $newIds);
        foreach ($removedIds as $id) {
            $student = Application::find($id);
            if ($student) {
                NotificationService::notifySecretaries(
                    'to_wait',
                    $student->full_name,
                    "{$student->full_name} — Retiré vers Liste d'Attente"
                );
            }
        }

        return response()->json([
            'message' => 'Liste principale mise à jour',
            'main_list_count' => $request->main_list_count,
            'main_list_ids' => $newIds
        ]);
    }
}