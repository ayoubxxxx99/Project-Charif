<?php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class ProfileController extends Controller
{
    public function show(Request $request)
    {
        return response()->json($request->user());
    }

    public function update(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'address'        => 'nullable|string|max:255',
            'date_of_birth'  => 'nullable|date',
            'guardian_name'  => 'nullable|string|max:255',
            'guardian_phone' => 'nullable|string|max:20',
        ]);

        if ($request->hasFile('avatar')) {
            $path = $request->file('avatar')->store('avatars', 'public');
            $data['avatar_path'] = $path;
        }

        $user->update($data);
        return response()->json($user);
    }
}
