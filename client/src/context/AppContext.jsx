import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import api from "../lib/api"; 

// Export the context directly so outside components can reference it if needed
export const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  
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

  useEffect(() => {
    async function checkAuth() {
      const token = localStorage.getItem("fitpass_token");
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const data = await api.getMe();
        // Match the Flask response structure mapping: {"user": {...}}
        setUser(data.user || data); 
      } catch (err) {
        console.error("Auth initialization failed:", err);
        localStorage.removeItem("fitpass_token"); 
      } finally {
        setLoading(false); 
      }
    }
    checkAuth();
  }, []);

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
    const data = await api.login(credentials);
    localStorage.setItem("fitpass_token", data.access_token);
    setUser(data.user);
    showToast("Welcome back!");
    return data;
  }, [showToast]);

  //REPAIRED & SANITIZED REGISTER PIPELINE
  const register = useCallback(async (signupData) => {
    // 🛠️ Sanitize payload data to perfectly fit Flask Marshmallow constraints
    const sanitizedPayload = {
      full_name: signupData.full_name?.trim(),
      email: signupData.email?.trim().toLowerCase(), // Enforce absolute lowercase
      password: signupData.password, // Keep exact password matching
      role: signupData.role, // Must be forwarded or every signup silently becomes "client"
    };

    // Only attach phone if the user actually typed something into it
    if (signupData.phone && signupData.phone.trim() !== "") {
      sanitizedPayload.phone = signupData.phone.trim();
    }

    // Dispatch clean payload data to api gateway file
    const data = await api.register(sanitizedPayload); 
    localStorage.setItem("fitpass_token", data.access_token);
    setUser(data.user);
    showToast("Account created successfully!");
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
    return <div className="min-h-screen bg-[#0B0C10] flex items-center justify-center text-zinc-500 font-sans tracking-widest text-xs">LOADING SYSTEM METRICS...</div>;
  }

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}