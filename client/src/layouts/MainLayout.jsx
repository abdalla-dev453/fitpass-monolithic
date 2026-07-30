import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "../components/Navbar.jsx";
import Footer from "../components/Footer.jsx";
import Toast from "../components/Toast.jsx";
import ScrollToTop from "../components/ScrollToTop.jsx";

export default function MainLayout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 selection:bg-emerald-400/30">
      <ScrollToTop />
      <Navbar />
      <main className="flex-1 animate-in" key={location.pathname}>
        <Outlet />
      </main>
      <Footer />
      <Toast />
    </div>
  );
}