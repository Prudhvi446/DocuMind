import { createContext, useContext, useState, useCallback } from "react";
import client from "../api/client.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [tenant, setTenant] = useState(() => {
    const stored = localStorage.getItem("tenant");
    return stored ? JSON.parse(stored) : null;
  });

  const persistAuth = useCallback((newToken, newTenant) => {
    setToken(newToken);
    setTenant(newTenant);
    localStorage.setItem("token", newToken);
    localStorage.setItem("tenant", JSON.stringify(newTenant));
  }, []);

  const login = async (email, password) => {
    const { data } = await client.post("/api/auth/login", { email, password });
    persistAuth(data.token, data.tenant);
    return data;
  };

  const register = async (email, password, name) => {
    const { data } = await client.post("/api/auth/register", {
      email,
      password,
      name,
    });
    persistAuth(data.token, data.tenant);
    return data;
  };

  const logout = () => {
    setToken(null);
    setTenant(null);
    localStorage.removeItem("token");
    localStorage.removeItem("tenant");
  };

  const refreshMe = async () => {
    const { data } = await client.get("/api/auth/me");
    const updated = {
      id: data.id,
      email: data.email,
      name: data.name,
      queryLimit: data.queryLimit,
      monthlyCount: data.monthlyCount,
      queryCount: data.queryCount,
    };
    setTenant((prev) => {
      const next = { ...prev, ...updated };
      localStorage.setItem("tenant", JSON.stringify(next));
      return next;
    });
    return data;
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        tenant,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        refreshMe,
        setTenant,
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
