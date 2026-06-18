import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../utils/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("glowup_token");
    const cached = localStorage.getItem("glowup_user");
    if (token && cached) {
      setUser(JSON.parse(cached));
      authAPI.me()
        .then(res => {
          setUser(res.data.user);
          // ✅ Always update localStorage with latest user data
          localStorage.setItem("glowup_user", JSON.stringify(res.data.user));
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    const { token, user } = res.data;
    localStorage.setItem("glowup_token", token);
    localStorage.setItem("glowup_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  const register = async (name, email, password) => {
    const res = await authAPI.register({ name, email, password });
    const { token, user } = res.data;
    localStorage.setItem("glowup_token", token);
    localStorage.setItem("glowup_user", JSON.stringify(user));
    setUser(user);
    return user;
  };

  // ✅ NEW: Profile save ke baad user state refresh karne ke liye
  const refreshUser = async () => {
    try {
      const res = await authAPI.me();
      const updatedUser = res.data.user;
      setUser(updatedUser);
      localStorage.setItem("glowup_user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (e) {
      console.error("refreshUser failed:", e);
    }
  };

  const logout = () => {
    localStorage.removeItem("glowup_token");
    localStorage.removeItem("glowup_user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);