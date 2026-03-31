<?php

namespace App\Support;

use App\Models\User;

class Permissions
{
    public static function normalizeRole(?string $role): string
    {
        $normalized = strtolower(trim((string) $role));
        $aliases = config('permissions.aliases', []);

        if ($normalized !== '' && isset($aliases[$normalized])) {
            return strtolower((string) $aliases[$normalized]);
        }

        return $normalized !== '' ? $normalized : 'viewer';
    }

    public static function roleDefinitions(): array
    {
        return config('permissions.roles', []);
    }

    public static function availableRoles(): array
    {
        return array_keys(self::roleDefinitions());
    }

    public static function permissionsForRole(?string $role): array
    {
        $definitions = self::roleDefinitions();
        $normalizedRole = self::normalizeRole($role);
        $permissions = $definitions[$normalizedRole]['permissions'] ?? [];

        return array_values(array_unique($permissions));
    }

    public static function has(User $user, string $permission): bool
    {
        $permissions = self::permissionsForRole($user->ROLE);

        return in_array('*', $permissions, true) || in_array($permission, $permissions, true);
    }

    public static function serializeRoleMatrix(): array
    {
        $matrix = [];

        foreach (self::roleDefinitions() as $role => $definition) {
            $matrix[] = [
                'role' => $role,
                'label' => $definition['label'] ?? ucfirst($role),
                'description' => $definition['description'] ?? '',
                'permissions' => array_values($definition['permissions'] ?? []),
            ];
        }

        return $matrix;
    }
}
