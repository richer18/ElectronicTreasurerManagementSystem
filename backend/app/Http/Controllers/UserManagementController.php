<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Support\Permissions;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    public function index(): JsonResponse
    {
        $users = User::query()
            ->orderBy('USERNAME')
            ->get([
                'USER_ID',
                'USERNAME',
                'EMAIL',
                'PHONE',
                'ROLE',
                'ACCOUNT_STATUS',
                'CREATED_AT',
            ])
            ->map(fn (User $user) => $this->serializeUser($user))
            ->values();

        return response()->json($users);
    }

    public function roles(): JsonResponse
    {
        return response()->json([
            'roles' => Permissions::serializeRoleMatrix(),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'username' => ['required', 'string', 'max:50', 'unique:users,USERNAME'],
            'email' => ['required', 'email', 'max:50', 'unique:users,EMAIL'],
            'phone' => ['required', 'string', 'max:15'],
            'role' => ['required', Rule::in(Permissions::availableRoles())],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'password' => ['required', 'string', 'min:8'],
        ]);

        $user = new User();
        $user->USERNAME = $validated['username'];
        $user->EMAIL = $validated['email'];
        $user->PHONE = $validated['phone'];
        $user->ROLE = $validated['role'];
        $user->ACCOUNT_STATUS = $validated['status'];
        $user->PASSWORD_HASH = Hash::make($validated['password']);
        $user->CREATED_AT = now();
        $user->save();

        return response()->json([
            'message' => 'User created successfully.',
            'user' => $this->serializeUser($user),
        ], 201);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'username' => [
                'required',
                'string',
                'max:50',
                Rule::unique('users', 'USERNAME')->ignore($user->USER_ID, 'USER_ID'),
            ],
            'email' => [
                'required',
                'email',
                'max:50',
                Rule::unique('users', 'EMAIL')->ignore($user->USER_ID, 'USER_ID'),
            ],
            'phone' => ['required', 'string', 'max:15'],
            'role' => ['required', Rule::in(Permissions::availableRoles())],
            'status' => ['required', Rule::in(['active', 'inactive', 'suspended'])],
            'password' => ['nullable', 'string', 'min:8'],
        ]);

        $user->USERNAME = $validated['username'];
        $user->EMAIL = $validated['email'];
        $user->PHONE = $validated['phone'];
        $user->ROLE = $validated['role'];
        $user->ACCOUNT_STATUS = $validated['status'];

        if (! empty($validated['password'])) {
            $user->PASSWORD_HASH = Hash::make($validated['password']);
        }

        $user->save();

        return response()->json([
            'message' => 'User updated successfully.',
            'user' => $this->serializeUser($user),
        ]);
    }

    private function serializeUser(User $user): array
    {
        return [
            'id' => $user->USER_ID,
            'username' => $user->USERNAME,
            'email' => $user->EMAIL,
            'phone' => $user->PHONE,
            'role' => $user->ROLE,
            'effective_role' => Permissions::normalizeRole($user->ROLE),
            'status' => $user->ACCOUNT_STATUS,
            'permissions' => Permissions::permissionsForRole($user->ROLE),
            'created_at' => optional($user->CREATED_AT)->toDateTimeString(),
        ];
    }
}
