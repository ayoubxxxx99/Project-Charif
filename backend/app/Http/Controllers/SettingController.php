<?php

namespace App\Http\Controllers;

use App\Models\Setting;
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

        // Met à jour le count
        Setting::updateOrCreate(
            ['key' => 'main_list_count'],
            ['value' => $request->main_list_count]
        );

        // Met à jour les IDs (stockés en JSON)
        Setting::updateOrCreate(
            ['key' => 'main_list_ids'],
            ['value' => json_encode($request->main_list_ids ?? [])]
        );

        return response()->json([
            'message' => 'Liste principale mise à jour',
            'main_list_count' => $request->main_list_count,
            'main_list_ids' => $request->main_list_ids ?? []
        ]);
    }
}