<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Str;

class AuthController extends Controller
{
    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:255'],
            'password' => ['required', 'string'],
            'remember' => ['sometimes', 'boolean'],
        ]);

        $throttleKey = Str::lower($validated['username']).'|'.$request->ip();

        if (RateLimiter::tooManyAttempts($throttleKey, 5)) {
            $seconds = RateLimiter::availableIn($throttleKey);

            return response()->json([
                'message' => "Too many login attempts. Try again in {$seconds} seconds.",
            ], 429);
        }

        $user = User::query()
            ->where('USERNAME', $validated['username'])
            ->first();

        if (
            $user &&
            filled($user->ACCOUNT_STATUS) &&
            strtoupper((string) $user->ACCOUNT_STATUS) !== 'ACTIVE'
        ) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'message' => 'This account is inactive.',
            ], 403);
        }

        $remember = (bool) ($validated['remember'] ?? false);

        if (! Auth::attempt([
            'USERNAME' => $validated['username'],
            'password' => $validated['password'],
        ], $remember)) {
            RateLimiter::hit($throttleKey, 60);

            return response()->json([
                'message' => 'Invalid credentials.',
            ], 401);
        }

        RateLimiter::clear($throttleKey);
        $request->session()->regenerate();

        /** @var User $authenticatedUser */
        $authenticatedUser = $request->user();

        return response()->json([
            'message' => 'Login successful',
            'user' => $this->serializeUser($authenticatedUser),
        ]);
    }

    public function user(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        return response()->json([
            'user' => $this->serializeUser($user),
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return response()->json([
            'message' => 'Logout successful',
        ]);
    }

    public function verifyPassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['nullable', 'string', 'max:255'],
            'password' => ['required', 'string'],
        ]);

        /** @var User $user */
        $user = $request->user();

        if (
            isset($validated['username']) &&
            strcasecmp($validated['username'], (string) $user->USERNAME) !== 0
        ) {
            return response()->json([
                'message' => 'You may only verify the active account.',
            ], 403);
        }

        if (! Auth::validate([
            'USERNAME' => $user->USERNAME,
            'password' => $validated['password'],
        ])) {
            return response()->json([
                'message' => 'Invalid password.',
            ], 401);
        }

        if (
            filled($user->ACCOUNT_STATUS) &&
            strtoupper((string) $user->ACCOUNT_STATUS) !== 'ACTIVE'
        ) {
            return response()->json([
                'message' => 'Account is inactive.',
            ], 403);
        }

        return response()->json([
            'message' => 'Permission granted.',
            'user' => $this->serializeUser($user),
        ]);
    }

    private function serializeUser(User $user): array
    {
        $effectiveRole = Permissions::normalizeRole($user->ROLE);

        return [
            'id' => $user->USER_ID,
            'username' => $user->USERNAME,
            'role' => $user->ROLE,
            'effective_role' => $effectiveRole,
            'status' => $user->ACCOUNT_STATUS,
            'permissions' => Permissions::permissionsForRole($user->ROLE),
        ];
    }
}
