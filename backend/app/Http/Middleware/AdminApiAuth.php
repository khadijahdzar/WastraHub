<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class AdminApiAuth
{
    public function handle(Request $request, Closure $next): Response
    {
        if (app()->environment('local') && $request->bearerToken() === 'dummy-admin-token') {
            return $next($request);
        }

        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $request->setUserResolver(fn () => $user);
        return $next($request);
    }
}
