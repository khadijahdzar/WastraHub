<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    /**
     * POST /api/register
     */
    public function register(Request $request)
    {
        try {
            $data = $request->validate([
                'name'                  => 'required|string|max:255',
                'email'                 => 'required|email|unique:users,email',
                'password'              => 'required|string|min:6',
                'password_confirmation' => 'nullable|string|same:password',
            ]);

            $user = User::create([
                'name'     => $data['name'],
                'email'    => $data['email'],
                'password' => Hash::make($data['password']),
                'role'     => 'user',
            ]);

            // Token dinamis per device untuk registrasi
            $deviceName = $request->header('User-Agent') ?? 'unknown-device';
            $token = $user->createToken($deviceName)->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Registrasi berhasil.',
                'user'    => $user,
                'token'   => $token,
            ], 201);

        } catch (\Exception $e) {
            Log::error('Register Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan saat registrasi.',
            ], 500);
        }
    }

    /**
     * POST /api/login
     */
    public function login(Request $request)
    {
        $data = $request->validate([
            'email'    => 'required|email',
            'password' => 'required|string',
        ]);

        $user = User::where('email', $data['email'])->first();

        if (! $user || ! Hash::check($data['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => ['Email atau password salah.'],
            ]);
        }

        try {
            // Gunakan User-Agent sebagai nama token supaya multi-device (Laptop & HP) 
            // punya token terpisah yang unik dan tidak saling menimpa.
            $deviceName = $request->header('User-Agent') ?? 'unknown-device';
            $token = $user->createToken($deviceName)->plainTextToken;

            return response()->json([
                'success' => true,
                'message' => 'Login berhasil.',
                'user'    => $user,
                'token'   => $token,
            ], 200);

        } catch (\Exception $e) {
            Log::error('Login Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Terjadi kesalahan pada server saat login.',
            ], 500);
        }
    }

    /**
     * POST /api/logout  (auth:sanctum)
     */
    public function logout(Request $request)
    {
        try {
            // Hapus token aktif di device yang sedang melakukan request logout
            $request->user()->currentAccessToken()->delete();

            return response()->json([
                'success' => true,
                'message' => 'Berhasil logout.',
            ], 200);

        } catch (\Exception $e) {
            Log::error('Logout Error: ' . $e->getMessage());

            return response()->json([
                'success' => false,
                'message' => 'Gagal melakukan logout.',
            ], 500);
        }
    }
}