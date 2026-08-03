import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ArrowRight, ShieldAlert, KeyRound, Mail } from "lucide-react";

export default function Login() {
  // Destructure user to check if they are already logged in
  const { login, user, showToast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Proactive redirection: If user is logged in, kick them out of login page
  useEffect(() => {
    if (user) {
      navigate(user.role === "admin" ? "/admin-dashboard" : user.role === "trainer" ? "/trainer-dashboard" : "/classes");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await login(form);
      navigate(data.user?.role === "admin" ? "/admin-dashboard" : data.user?.role === "trainer" ? "/trainer-dashboard" : "/classes");
    } catch (err) {
      // Safely extract message from Flask response or fallback
      const errorMsg = err.response?.data?.error || err.message || "AUTHENTICATION FAILED.";
      setError(errorMsg.toUpperCase());
      showToast("LOGIN PHASE REJECTED.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#0B0C10] text-white select-none min-h-screen flex items-center justify-center pt-24 pb-12 bg-gym-grid px-4">
      
      {/* SOLID METRIC FORM SHELL BRACKET */}
      <div className="w-full max-w-md border-2 border-zinc-800 bg-zinc-950 p-6 md:p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]">
        
        {/* HEADER BLOCK BRAND MARK */}
        <div className="text-center border-b-2 border-zinc-900 pb-6">
          <div className="inline-flex mb-3">
            <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans font-black tracking-widest text-[9px]  px-3 py-1">
              ATHLETE GATEWAY PORTAL
            </span>
          </div>
          <h2 className="font-display font-black text-3xl  tracking-tighter text-white">
            ENGAGE YOUR <span className="text-[#CCFF00]">SESSION.</span>
          </h2>
        </div>

        {/* COMPREHENSIVE CRASH ALERTS SCREEN */}
        {error && (
          <div className="mt-6 border border-red-900 bg-red-950/40 p-4 flex items-center gap-3">
            <ShieldAlert size={16} className="text-red-500 shrink-0" strokeWidth={2.5} />
            <p className="text-[10px] font-black  tracking-widest text-red-400 leading-normal">
              {error}
            </p>
          </div>
        )}

        {/* INPUT DISPATCH FORM CHASSIS */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-5">
          
          {/* EMAIL ALLOCATION FIELD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black  tracking-widest text-zinc-500">OPERATIONAL EMAIL IDENTIFIER</label>
            <div className="relative border-2 border-zinc-800 bg-zinc-900 p-1 focus-within:border-[#CCFF00] transition-colors duration-100">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
              <input
                type="email"
                required
                disabled={loading}
                value={form.email}
                // FIXED: Removed .toUpperCase() to preserve casing integrity for database matching
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ENTER REGISTERED EMAIL"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black  tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* PASSWORD LOCK ALLOCATION FIELD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black  tracking-widest text-zinc-500">SECURITY CODE ENCRYPTION</label>
            <div className="relative border-2 border-zinc-800 bg-zinc-900 p-1 focus-within:border-[#CCFF00] transition-colors duration-100">
              <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
              <input
                type="password"
                required
                disabled={loading}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="ENTER SECURE CODE"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black  tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* PRIMARY TRANSMISSION ACTION BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-zinc-900 disabled:border-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {loading ? "INITIALIZING ROUTE AUDIT..." : "INITIALIZE SECURITY LINK"}
              {!loading && <ArrowRight size={14} strokeWidth={3} />}
            </button>
          </div>
        </form>

        {/* REDIRECT ACCESS LINK MATRIX */}
        <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
          <p className="text-[10px] font-black  tracking-widest text-zinc-500">
            NEW ATHLETE TO THE COMPREHENSIVE FEDERATION NETWORK?
          </p>
          <Link
            to="/register"
            className="inline-block mt-2 text-xs font-black  tracking-wider text-[#CCFF00] hover:text-white underline decoration-2 underline-offset-4"
          >
            INITIALIZE NEW ACCOUNT PASSPORT
          </Link>
        </div>

      </div>
    </div>
  );
}
