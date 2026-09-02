import { createContext, useContext, useEffect, useState } from "react";
import {
  loginUser,
  signupUser,
  getCurrentUser,
} from "../services/authApi";

const AuthContext = createContext(null);

const TOKEN_KEY = "foodchow_auth_token";
const USER_KEY = "foodchow_auth_user";

const normalizeRole = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/-/g, "_")
    .replace(/\s+/g, "_");

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem(USER_KEY);
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (error) {
      console.error("Unable to read stored user:", error);
      return null;
    }
  });

  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY) || null
  );

  const [loading, setLoading] = useState(true);

  /**
   * Save authentication session.
   */
  const saveSession = (authData) => {
    console.log("FoodChow login response:", authData);

    const receivedToken =
      authData?.access_token ||
      authData?.token ||
      authData?.accessToken;

    const receivedUser =
      authData?.user ||
      authData?.account ||
      authData?.data?.user ||
      null;

    if (!receivedToken) {
      console.error(
        "Login succeeded but no access token was returned.",
        authData
      );

      throw new Error(
        "Login succeeded, but the authentication token was not returned by the server."
      );
    }

    // Save token
    localStorage.setItem(TOKEN_KEY, receivedToken);
    setToken(receivedToken);

    // Save user
    if (receivedUser) {
      localStorage.setItem(USER_KEY, JSON.stringify(receivedUser));
      setUser(receivedUser);
    }

    // Verify that the token was actually persisted
    const savedToken = localStorage.getItem(TOKEN_KEY);

    if (!savedToken) {
      throw new Error(
        "Authentication token could not be saved in browser storage."
      );
    }

    console.log("FoodChow authentication session saved successfully.");

    return {
      token: receivedToken,
      user: receivedUser,
    };
  };

  /**
   * Login
   */
  const login = async (email, password) => {
    const data = await loginUser(email, password);

    saveSession(data);

    return data;
  };

  /**
   * Signup
   */
  const signup = async (userData) => {
    const data = await signupUser(userData);

    return data;
  };

  /**
   * Logout
   */
  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);

    console.log("FoodChow user logged out.");
  };

  /**
   * Get current authenticated user from backend.
   */
  const refreshUser = async (activeToken = token) => {
    if (!activeToken) {
      return null;
    }

    try {
      const currentUser = await getCurrentUser();

      const normalizedUser =
        currentUser?.user ||
        currentUser?.account ||
        currentUser?.data?.user ||
        currentUser;

      if (normalizedUser) {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(normalizedUser)
        );

        setUser(normalizedUser);
      }

      return normalizedUser;
    } catch (error) {
      console.error(
        "Unable to refresh authenticated user:",
        error
      );

      if (error?.response?.status === 401) {
        logout();
      }

      return null;
    }
  };

  /**
   * Restore authentication session after page refresh.
   */
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (storedToken) {
        setToken(storedToken);
        await refreshUser(storedToken);
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const role = normalizeRole(
    user?.role ||
      user?.user_role ||
      user?.account_role ||
      ""
  );

  const isAdmin =
    role === "admin" ||
    role === "administrator";

  const isSupportAgent =
    role === "support_agent" ||
    role === "supportagent" ||
    role === "agent";

  const isViewer =
    role === "viewer" ||
    role === "read_only" ||
    role === "readonly";

  const isAuthenticated = Boolean(token && user);

  /**
   * Role helper.
   */
  const hasRole = (...allowedRoles) => {
    const normalizedRoles = allowedRoles.map(normalizeRole);

    return normalizedRoles.includes(role);
  };

  /**
   * Permission helper.
   *
   * RBAC remains available for protected actions.
   * Admin Console pages themselves are intentionally accessible
   * to every authenticated user for the interview/demo flow.
   */
  const can = (permission) => {
    if (isAdmin) {
      return true;
    }

    const permissions = {
      support_chat: ["support_agent"],
      diagnostics: ["support_agent"],

      ticket_view: [
        "support_agent",
        "viewer",
      ],

      ticket_manage: ["support_agent"],

      human_handoff: ["support_agent"],

      knowledge_view: [
        "support_agent",
        "viewer",
      ],

      analytics_view: [
        "support_agent",
        "viewer",
      ],

      settings_view: [
        "support_agent",
        "viewer",
      ],

      admin_dashboard: ["admin"],
      user_management: ["admin"],
      approval_management: ["admin"],
    };

    return (
      permissions[permission]?.includes(role) ||
      false
    );
  };

  const value = {
    user,
    token,
    loading,
    role,

    isAuthenticated,
    isAdmin,
    isSupportAgent,
    isViewer,

    login,
    signup,
    logout,
    refreshUser,

    hasRole,
    can,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside an AuthProvider"
    );
  }

  return context;
};

export default AuthContext;