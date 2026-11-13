import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { loginUser, registerUser, logoutUser, getStudentProfile, updateStudentProfile } from "../services/authService";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem("portal_user");
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("portal_token"));
  const [profile, setProfile] = useState(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState("login"); // 'login' | 'register'

  const isAuthenticated = Boolean(token && user);
  const isAdmin = user?.role === "ROLE_ADMIN" || user?.role === "ADMIN";

  const refreshProfile = useCallback(async () => {
    if (!user) return;
    try {
      const res = await getStudentProfile(user.username, user.userId);
      if (res.success && res.data) {
        setProfile(res.data);
      }
    } catch {
      // offline fallback
    }
  }, [user]);

  useEffect(() => {
    if (isAuthenticated) {
      refreshProfile();
    } else {
      setProfile(null);
    }
  }, [isAuthenticated, refreshProfile]);

  const login = async (usernameOrEmail, password) => {
    const result = await loginUser(usernameOrEmail, password);
    if (result.success && result.data) {
      setUser(result.data);
      setToken(result.data.token);
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || "Login failed" };
  };

  const register = async (userData) => {
    const result = await registerUser(userData);
    if (result.success && result.data) {
      setUser(result.data);
      setToken(result.data.token);
      return { success: true, data: result.data };
    }
    return { success: false, error: result.error || "Registration failed" };
  };

  const logout = () => {
    logoutUser();
    setUser(null);
    setToken(null);
    setProfile(null);
  };

  const saveProfile = async (profileData) => {
    const res = await updateStudentProfile(profileData, user?.userId);
    if (res.success) {
      await refreshProfile();
      return { success: true };
    }
    return { success: false, error: res.error || "Failed to update profile" };
  };

  const openAuthModal = (mode = "login") => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setAuthModalOpen(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      profile,
      isAuthenticated,
      isAdmin,
      login,
      register,
      logout,
      saveProfile,
      refreshProfile,
      authModalOpen,
      authModalMode,
      openAuthModal,
      closeAuthModal
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
