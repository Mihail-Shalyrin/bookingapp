import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser({
          username: decoded.sub,
          roles: (decoded.roles || []).map((r) => r.replace(/^ROLE_/, "")),
        });
      } catch (e) {
        localStorage.clear();
      }
    }
    setLoading(false);
  }, []);

  const loginAs = (accessToken, refreshToken) => {
    localStorage.setItem("accessToken", accessToken);
    localStorage.setItem("refreshToken", refreshToken);
    const decoded = jwtDecode(accessToken);
    setUser({
      username: decoded.sub,
      roles: (decoded.roles || []).map((r) => r.replace(/^ROLE_/, "")),
    });
  };

  const logout = () => {
    localStorage.clear();
    setUser(null);
  };

  const hasRole = (role) => user?.roles?.includes(role);

  return (
    <AuthContext.Provider value={{ user, loading, loginAs, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);