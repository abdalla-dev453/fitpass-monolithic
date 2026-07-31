import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import api from "../lib/api"; // Added direct integration for your new endpoint mapping layers

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Real Auth State Variables to support your new api.js changes
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [myPass, setMyPass] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  // Fetch logged in user details instantly if an active token resides locally
  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("fitpass_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const userData = await api.getMe();
        setUser(userData);
      } catch (err) {
        console.error("Auth initialization failed:", err);
        localStorage.removeItem("fitpass_token"); // Sweep bad/expired tokens out cleanly
      } finally {
        setLoading(false);
      }
    }
    checkAuth();
  }, []);

  // Interactive purchase execution linked directly to your new api setup
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

  // Authentication utility wrapper methods
  const login = useCallback(async (credentials) => {
    const data = await api.login(credentials);
    localStorage.setItem("fitpass_token", data.access_token);
    setUser(data.user);
    showToast("Welcome back!");
    return data;
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

  // Prevent app rendering freezes while initial token tracking finishes processing
  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400">Loading...</div>;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}
