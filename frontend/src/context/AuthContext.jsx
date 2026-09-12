import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

const USER_KEY = "wastrahub_user";
const USER_TOKEN_KEY = "wastrahub_user_token";
const LEGACY_TOKEN_KEY = "wastrahub_token";

/**
 * AuthContext KHUSUS pembeli (user storefront).
 * Admin memakai session terpisah: wastrahub_admin_user + wastrahub_admin_token.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem(USER_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed?.role === "admin" || parsed?.role === "superadmin") {
          if (!localStorage.getItem("wastrahub_admin_user")) {
            localStorage.setItem("wastrahub_admin_user", stored);
            const t =
              localStorage.getItem("wastrahub_admin_token") ||
              localStorage.getItem(LEGACY_TOKEN_KEY);
            if (t) localStorage.setItem("wastrahub_admin_token", t);
          }
          localStorage.removeItem(USER_KEY);
        } else {
          setUser(parsed);
        }
      } catch {
        localStorage.removeItem(USER_KEY);
      }
    }
    setLoading(false);
  }, []);

  const persist = (userData) => {
    setUser(userData);
    if (userData) localStorage.setItem(USER_KEY, JSON.stringify(userData));
    else localStorage.removeItem(USER_KEY);
  };

  const login = (userData, token) => {
    if (userData?.role === "admin" || userData?.role === "superadmin") {
      console.warn("[AuthContext] login admin ditolak di user context");
      return;
    }
    persist(userData);
    if (token) {
      localStorage.setItem(USER_TOKEN_KEY, token);
    }
  };

  const logout = () => {
    persist(null);
    localStorage.removeItem(USER_TOKEN_KEY);
    const adminTok = localStorage.getItem("wastrahub_admin_token");
    const legacy = localStorage.getItem(LEGACY_TOKEN_KEY);
    if (legacy && legacy !== adminTok) {
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
  };

  const register = (userData) => {
    const newUser = { ...userData, id: userData.id || Date.now(), role: "user" };
    persist(newUser);
    return newUser;
  };

  const updateProfile = (updates) => {
    if (!user) return null;
    const next = { ...user, ...updates };
    persist(next);
    return next;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        register,
        updateProfile,
        isAuthenticated: !!user,
        isAdmin: false,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}

/* ========== Admin session helpers ========== */

export function getAdminSession() {
  try {
    const raw = localStorage.getItem("wastrahub_admin_user");
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function setAdminSession(userData, token) {
  if (userData) {
    localStorage.setItem("wastrahub_admin_user", JSON.stringify(userData));
  } else {
    localStorage.removeItem("wastrahub_admin_user");
  }
  if (token) {
    localStorage.setItem("wastrahub_admin_token", token);
  } else if (userData === null) {
    localStorage.removeItem("wastrahub_admin_token");
  }
}

export function clearAdminSession() {
  localStorage.removeItem("wastrahub_admin_user");
  localStorage.removeItem("wastrahub_admin_token");
}

export function isAdminLoggedIn() {
  const u = getAdminSession();
  return !!(u && (u.role === "admin" || u.role === "superadmin"));
}