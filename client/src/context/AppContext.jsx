import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import api from "../lib/api";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [myPass, setMyPass] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimer.current) {
      window.clearTimeout(toastTimer.current);
      toastTimer.current = null;
    }
  }, []);

  const showToast = useCallback((message) => {
    setToast(message);
    clearToastTimer();
    toastTimer.current = window.setTimeout(() => {
      setToast(null);
      toastTimer.current = null;
    }, 3200);
  }, [clearToastTimer]);

  useEffect(() => {
    return () => clearToastTimer();
  }, [clearToastTimer]);

  useEffect(() => {
    let cancelled = false;

    async function checkAuth() {
      const token = localStorage.getItem("fitpass_token");
      if (!token) {
        if (!cancelled) setLoading(false);
        return;
      }

      try {
        const data = await api.getMe();
        if (!cancelled) {
          setUser(data.user || data);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        if (!cancelled) {
          localStorage.removeItem("fitpass_token");
          setUser(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    checkAuth();

    return () => {
      cancelled = true;
      clearToastTimer();
    };
  }, [clearToastTimer]);

  const purchasePlan = useCallback(
    async (plan) => {
      try {
        await api.purchasePass(plan.key || plan.id);
        setMyPass(plan);
        showToast(`You're in — ${plan.name} is active on your account.`);
      } catch (err) {
        showToast(err.message || "Failed to complete pass purchase.");
      }
    },
    [showToast]
  );

  const login = useCallback(async (credentials) => {
    try {
      const data = await api.login(credentials);
      localStorage.setItem("fitpass_token", data.access_token);
      setUser(data.user || data);
      showToast("Welcome back!");
      return data;
    } catch (err) {
      showToast(err.message || "Login failed.");
      throw err;
    }
  }, [showToast]);

  const register = useCallback(async (signupData) => {
    const sanitizedPayload = {
      full_name: signupData.full_name?.trim(),
      email: signupData.email?.trim().toLowerCase(),
      password: signupData.password,
      role: signupData.role === "trainer" ? "trainer" : "client",
    };

    if (signupData.phone && signupData.phone.trim() !== "") {
      sanitizedPayload.phone = signupData.phone.trim();
    }

    try {
      const data = await api.register(sanitizedPayload);
      localStorage.setItem("fitpass_token", data.access_token);
      setUser(data.user || data);
      showToast("Account created successfully!");
      return data;
    } catch (err) {
      showToast(err.message || "Registration failed.");
      throw err;
    }
  }, [showToast]);

  const logout = useCallback(() => {
    localStorage.removeItem("fitpass_token");
    setUser(null);
    setMyPass(null);
    showToast("Logged out successfully.");
  }, [showToast]);

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    mobileMenuOpen,
    setMobileMenuOpen,
    activeCategory,
    setActiveCategory,
    searchQuery,
    setSearchQuery,
    myPass,
    purchasePlan,
    toast,
    showToast,
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-zinc-500 font-sans tracking-widest text-xs">
        LOADING SYSTEM METRICS...
      </div>
    );
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
