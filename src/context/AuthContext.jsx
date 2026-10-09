import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useEffect,
} from "react";
import axios from "axios";
import { identityBaseUrl } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("token");
    const savedUser = localStorage.getItem("user");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (token, userData) => {
    setToken(token);
    setUser(userData);
    localStorage.setItem("token", token);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const updateUser = useCallback((patch) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...patch };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token || !user?.id) return null;
    try {
      const response = await axios.get(`${identityBaseUrl}/users/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const fresh = response?.data?.data;
      if (!fresh) throw new Error("Unexpected response format from the server.");
      updateUser({
        must_change_password: fresh.must_change_password ?? 0,
      });
      return fresh;
    } catch (error) {
      console.error("Error refreshing user:", error);
      return null;
    }
  }, [token, user?.id, updateUser]);

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  };

  const value = useMemo(
    () => ({
      user,
      token,
      role: user?.role,
      login,
      logout,
      updateUser,
      refreshUser,
      loading,
      isAuthenticated: !!token,
    }),
    [user, token, loading, updateUser, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
