<?php

namespace App\Http\Controllers;

use App\Models\Setting;
use Illuminate\Http\Request;

class SettingController extends Controller
{
    public function getMainListCount()
    {
        $setting = Setting::where('key', 'main_list_count')->first();
        return response()->json([
            'main_list_count' => $setting ? (int) $setting->value : 0
        ]);
    }

    public function updateMainListCount(Request $request)
    {
        $request->validate([
            'main_list_count' => 'required|integer|min:0'
        ]);

        Setting::updateOrCreate(
            ['key' => 'main_list_count'],
            ['value' => $request->main_list_count]
        );

        return response()->json([
            'message' => 'Taille de la liste principale mise à jour',
            'main_list_count' => $request->main_list_count
        ]);
    }
}