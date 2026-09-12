<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminMiddleware
{
    public function handle(Request $request, Closure $next): Response
    {
        // Mode demo lokal
        if (
            app()->environment('local') &&
            $request->bearerToken() === 'dummy-admin-token'
        ) {
            return $next($request);
        }

        $user = $request->user();

        if (
            !$user ||
            !in_array($user->role ?? '', ['admin', 'superadmin'], true)
        ) {
            return response()->json([
                'message' => 'Unauthorized. Admin only.',
            ], 403);
        }

        return $next($request);
    }
}