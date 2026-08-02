import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";
import { useApp } from "../context/AppContext.jsx"; // Access toast notifications globally

export default function MainLayout() {
  const location = useLocation();
  const { toast } = useApp(); // Track the current alert payload

  // Array of paths where the standard footer should not be rendered
  const authRoutes = ["/login", "/register"];
  const isAuthPage = authRoutes.includes(location.pathname);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-emerald-400/30">
      <ScrollToTop />
      
      {/* Top Level Global Command Bar */}
      <Navbar />
      
      {/* Dynamic Viewport Container Slot */}
      <main className="flex-1 animate-in" key={location.pathname}>
        <Outlet />
      </main>
      
      {/* Conditionally suppress footer rendering inside authentication interfaces */}
      {!isAuthPage && <Footer />}
      
      {/* Render notifications dynamically from context state triggers */}
      {toast && <Toast message={toast} />}
    </div>
  );
}
