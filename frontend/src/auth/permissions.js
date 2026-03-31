export function getUserPermissions(user) {
  return Array.isArray(user?.permissions) ? user.permissions : [];
}

export function hasPermission(user, permission) {
  const permissions = getUserPermissions(user);

  return permissions.includes("*") || permissions.includes(permission);
}

export function hasAnyPermission(user, requiredPermissions = []) {
  if (!requiredPermissions || requiredPermissions.length === 0) {
    return true;
  }

  return requiredPermissions.some((permission) => hasPermission(user, permission));
}
