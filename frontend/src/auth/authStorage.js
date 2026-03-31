export function getStoredAuthUser() {
  try {
    return JSON.parse(localStorage.getItem("authUser") || "null");
  } catch (error) {
    return null;
  }
}

export function storeAuthenticatedUser(user, options = {}) {
  if (user) {
    localStorage.setItem("authUser", JSON.stringify(user));
    localStorage.setItem("isAuthenticated", "true");
  } else {
    localStorage.removeItem("authUser");
    localStorage.removeItem("isAuthenticated");
  }

  if (options.updateLoginAt) {
    localStorage.setItem("lastLoginAt", new Date().toISOString());
  }
}

export function clearAuthStorage() {
  localStorage.removeItem("authUser");
  localStorage.removeItem("isAuthenticated");
  localStorage.removeItem("lastLoginAt");
}
