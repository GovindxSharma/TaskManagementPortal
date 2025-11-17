import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  // Safe parsing for user from localStorage
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("user");
    try {
      return stored && stored !== "undefined" ? JSON.parse(stored) : null;
    } catch (err) {
      console.warn("Failed to parse stored user:", err);
      return null;
    }
  });

  // Safe handling for token from localStorage
  const [token, setToken] = useState(() => {
    const t = localStorage.getItem("token");
    return t && t !== "undefined" ? t : null;
  });

  const [loading, setLoading] = useState(false);

  // Login function — saves user & token safely
  const login = (userData, tokenValue) => {
    if (!userData || !tokenValue) return;
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", tokenValue);
    setUser(userData);
    setToken(tokenValue);
  };

  // Logout function — removes user & token
  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use Auth context
export const useAuth = () => useContext(AuthContext);
