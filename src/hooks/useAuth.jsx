import { createContext, useContext, useEffect, useState } from "react";

// Create Auth Context
const AuthContext = createContext({
  user: null,
  token: null,
  login: () => {},
  logout: () => {},
  loading: false,
});

// Auth Provider
export const AuthProvider = ({ children }) => {
  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem("user");
      if (stored && stored !== "undefined") return JSON.parse(stored);
      return null;
    } catch (err) {
      console.warn("Failed to parse stored user:", err);
      return null;
    }
  });

  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" ? t : null;
  });

  // Login function
  const login = (userData, tokenValue) => {
    if (!userData || !tokenValue) return;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
    setUser(userData);
    setToken(tokenValue);
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  // Ensure we stop loading after initial check
  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
