import React, { createContext, useContext, useState, useCallback, useRef } from "react";

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  // Mocked membership state — there's no auth/checkout flow on this site yet,
  // so a "purchase" just records a plan locally and surfaces a confirmation
  // toast. Swap this for POST /passes/purchase/<plan_key> once auth exists.
  const [myPass, setMyPass] = useState(null);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimer.current);
    toastTimer.current = window.setTimeout(() => setToast(null), 3200);
  }, []);

  const purchasePlan = useCallback(
    (plan) => {
      setMyPass(plan);
      showToast(`You're in — ${plan.name} is active on your account.`);
    },
    [showToast]
  );

  const value = {
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

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used within an AppProvider");
  return ctx;
}