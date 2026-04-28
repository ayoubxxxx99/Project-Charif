<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Profile; // NE PAS OUBLIER CET IMPORT

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        // On récupère l'utilisateur ET son profil lié
        $user = $request->user()->load('profile');
        return response()->json($user->profile ?: []);
    }

    public function update(Request $request)
    {
        $user = $request->user();

        $data = $request->validate([
            'address'        => 'nullable|string|max:255',
            'date_of_birth'  => 'nullable|date',
            'guardian_name'  => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
            'avatar'         => 'nullable|image|max:2048', // Validation pour l'image
        ]);

        // Gestion de l'image
        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_path'] = $path;
        }

        // CORRECT : On met à jour (ou on crée) dans la table PROFILES
        $profile = $user->profile()->updateOrCreate(
            ['user_id' => $user->id],
            $data
        );

        return response()->json($profile);
    }
}