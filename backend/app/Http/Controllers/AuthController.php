<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;
use App\Mail\ResetCodeMail;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Carbon\Carbon;

class AuthController extends Controller
{
public function login(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'password' => 'required',
    ]);

    $user = User::where('email', $request->email)->first();


    if (! $user || ! Hash::check($request->password, $user->password)) {
        throw ValidationException::withMessages([
            'email' => ['Les identifiants sont incorrects.'],
        ]);
    }


    $token = $user->createToken('auth-token')->plainTextToken;


    return response()->json([
        'token' => $token,
        'user' => [
            'name' => $user->name,
            'role' => $user->role, 
            'email' => $user->email
        ]
    ]);
}

public function register(Request $request)
{
    $request->validate([
        'name' => 'required|string|max:255',
        'email' => 'required|string|email|max:255|unique:users',
        'password' => 'required|string|min:8|confirmed',
    ]);

    $user = \App\Models\User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => \Illuminate\Support\Facades\Hash::make($request->password),
        'role' => 'student',
       
    ]);

    $token = $user->createToken('auth_token')->plainTextToken;

    return response()->json([
    'token' => $token,
    'user' => [
        'name' => $user->name,
        'role' => $user->role,
        'email' => $user->email
    ]
    ]);
}
public function forgotPassword(Request $request)
{
    $request->validate(['email' => 'required|email']);

    $user = User::where('email', $request->email)->first();
    if (!$user) {
        return response()->json(['message' => 'Aucun compte associé à cet email.'], 404);
    }

    $code = (string) random_int(100000, 999999);

    DB::table('password_reset_codes')->updateOrInsert(
        ['email' => $request->email],
        [
            'code' => $code,
            'expires_at' => Carbon::now()->addMinutes(3),
            'updated_at' => Carbon::now(),
            'created_at' => Carbon::now(),
        ]
    );

    Mail::to($request->email)->send(new ResetCodeMail($code));

    return response()->json(['message' => 'Code envoyé par email.']);
}

public function verifyResetCode(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'code' => 'required|string',
    ]);

    $record = DB::table('password_reset_codes')
        ->where('email', $request->email)
        ->where('code', $request->code)
        ->first();

    if (!$record || Carbon::parse($record->expires_at)->isPast()) {
        return response()->json(['message' => 'Code invalide ou expiré.'], 400);
    }

    return response()->json(['message' => 'Code valide.']);
}

public function resetPassword(Request $request)
{
    $request->validate([
        'email' => 'required|email',
        'code' => 'required|string',
        'password' => 'required|min:8|confirmed',
    ]);

    $record = DB::table('password_reset_codes')
        ->where('email', $request->email)
        ->where('code', $request->code)
        ->first();

    if (!$record || Carbon::parse($record->expires_at)->isPast()) {
        return response()->json(['message' => 'Code invalide ou expiré.'], 400);
    }

    $user = User::where('email', $request->email)->first();
    $user->password = bcrypt($request->password);
    $user->save();

    DB::table('password_reset_codes')->where('email', $request->email)->delete();

    return response()->json(['message' => 'Mot de passe mis à jour avec succès.']);
}

}
