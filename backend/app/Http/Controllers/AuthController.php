<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\ValidationException;

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
            'role' => $user->role, //
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
}
