import React from "react";
import axiosInstance, { ensureCsrfCookie } from "../api/axiosInstance";
import {
  clearAuthStorage,
  getStoredAuthUser,
  storeAuthenticatedUser,
} from "./authStorage";

const AuthContext = React.createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = React.useState(() => getStoredAuthUser());
  const [isCheckingAuth, setIsCheckingAuth] = React.useState(true);

  const syncUser = React.useCallback((nextUser, options = {}) => {
    setUser(nextUser);
    storeAuthenticatedUser(nextUser, options);
  }, []);

  const clearAuth = React.useCallback(() => {
    setUser(null);
    clearAuthStorage();
  }, []);

  const refreshUser = React.useCallback(async () => {
    try {
      const response = await axiosInstance.get("user");
      const nextUser = response?.data?.user ?? null;
      syncUser(nextUser);
      return nextUser;
    } catch (error) {
      clearAuth();
      throw error;
    }
  }, [clearAuth, syncUser]);

  const login = React.useCallback(
    async (credentials) => {
      await ensureCsrfCookie();
      const response = await axiosInstance.post("login", credentials);
      const nextUser = response?.data?.user ?? null;
      syncUser(nextUser, { updateLoginAt: true });
      return nextUser;
    },
    [syncUser]
  );

  const logout = React.useCallback(async () => {
    try {
      await axiosInstance.post("logout");
    } catch (error) {
      // Clear the local session state even if the server session is already gone.
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  React.useEffect(() => {
    let isMounted = true;
    const pathname =
      typeof window !== "undefined" ? window.location.pathname : "/";
    const hasStoredUser = Boolean(getStoredAuthUser());
    const isProtectedRoute = pathname.startsWith("/my-app");

    const bootstrapAuth = async () => {
      if (!hasStoredUser && !isProtectedRoute) {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
        return;
      }

      try {
        const response = await axiosInstance.get("user");
        if (!isMounted) return;
        syncUser(response?.data?.user ?? null);
      } catch (error) {
        if (!isMounted) return;
        clearAuth();
      } finally {
        if (isMounted) {
          setIsCheckingAuth(false);
        }
      }
    };

    bootstrapAuth();

    return () => {
      isMounted = false;
    };
  }, [clearAuth, syncUser]);

  const value = React.useMemo(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      isCheckingAuth,
      login,
      logout,
      refreshUser,
      clearAuth,
    }),
    [clearAuth, isCheckingAuth, login, logout, refreshUser, user]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = React.useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }

  return context;
}
