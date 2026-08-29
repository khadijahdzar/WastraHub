import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("wastrahub_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        localStorage.removeItem("wastrahub_user");
      }
    }
    setLoading(false);
  }, []);

  const persist = (userData) => {
    setUser(userData);
    if (userData) localStorage.setItem("wastrahub_user", JSON.stringify(userData));
    else localStorage.removeItem("wastrahub_user");
  };

  const login = (userData) => persist(userData);
  const logout = () => persist(null);

  const register = (userData) => {
    const newUser = { ...userData, id: Date.now(), role: "user" };
    persist(newUser);
    return newUser;
  };

  const updateProfile = (updates) => {
    if (!user) return null;
    const next = { ...user, ...updates };
    persist(next);
    return next;
  };

  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

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
        isAdmin,
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
