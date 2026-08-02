import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ArrowRight, ShieldAlert, KeyRound, Mail, User, ShieldCheck, Dumbbell } from "lucide-react";

export default function Register() {
  const { register, user, showToast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ 
    full_name: "",
    email: "", 
    password: "", 
    phone: "",
    role: "user" // Default fallback role selection
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Proactive redirection: If user is already logged in, redirect away from register
  useEffect(() => {
    if (user) {
      navigate("/classes");
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await register(form);
      navigate("/classes"); // Redirect straight to dashboard on success
    } catch (err) {
      // Catch Flask Marshmallow validator errors or custom duplicate key alerts
      const errorMsg = err.response?.data?.error || err.message || "REGISTRATION PIPELINE REJECTED.";
      setError(errorMsg.toUpperCase());
      showToast("REGISTRATION PHASE ABORTED.");
    } finally {
      setLoading(false);
    }
  };

  // Role Configuration Map for UI styling
  const roles = [
    { key: "user", label: "ATHLETE", icon: User, desc: "Standard access node" },
    { key: "trainer", label: "TRAINER", icon: Dumbbell, desc: "Command instruction modules" },
    { key: "admin", label: "ADMIN", icon: ShieldCheck, desc: "Root infrastructure override" }
  ];

  return (
    <div className="bg-[#0B0C10] text-white select-none min-h-screen flex items-center justify-center pt-28 pb-12 bg-gym-grid px-4">
      
      {/* SOLID METRIC FORM SHELL BRACKET */}
      <div className="w-full max-w-md border-2 border-zinc-800 bg-zinc-950 p-6 md:p-8 rounded-none shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]">
        
        {/* HEADER BLOCK BRAND MARK */}
        <div className="text-center border-b-2 border-zinc-900 pb-6">
          <div className="inline-flex mb-3">
            <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans font-black tracking-widest text-[9px]  px-3 py-1">
              FEDERATION IDENTITY HUB
            </span>
          </div>
          <h2 className="font-display font-black text-3xl  tracking-tighter text-white">
            FORGE YOUR <span className="text-[#CCFF00]">PASSPORT.</span>
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
          
          {/* FULL NAME ALLOCATION FIELD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black  tracking-widest text-zinc-500">ATHLETE CALLSIGN / FULL NAME</label>
            <div className="relative border-2 border-zinc-800 bg-zinc-900 p-1 focus-within:border-[#CCFF00] transition-colors duration-100">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
              <input
                type="text"
                required
                disabled={loading}
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                placeholder="ENTER VISUAL IDENTITY NAME"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black  tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

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
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ENTER UNIQUE EMAIL NODE"
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
                placeholder="GENERATE SECURE CODE"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black  tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC ROLE MATRIX COMPONENT */}
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">CLEARANCE LAYER ACCESS ROLE</label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((roleObj) => {
                const IconComponent = roleObj.icon;
                const isSelected = form.role === roleObj.key;
                return (
                  <button
                    key={roleObj.key}
                    type="button"
                    disabled={loading}
                    onClick={() => setForm({ ...form, role: roleObj.key })}
                    className={`flex flex-col items-center justify-center p-3 border-2 transition-all duration-150 ${
                      isSelected 
                        ? "border-[#CCFF00] bg-[#CCFF00]/5 text-[#CCFF00]" 
                        : "border-zinc-800 bg-zinc-900 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <IconComponent size={16} strokeWidth={2.5} className="mb-1" />
                    <span className="text-[9px] font-black tracking-widest uppercase">{roleObj.label}</span>
                    <span className="text-[6px] font-medium tracking-normal text-zinc-600 mt-0.5 text-center hidden md:block">
                      {roleObj.desc}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* PRIMARY TRANSMISSION ACTION BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-zinc-900 disabled:border-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {loading ? "ESTABLISHING CLEARANCE REGISTRY..." : "AUTHORIZE IDENTITY REGISTRY"}
              {!loading && <ArrowRight size={14} strokeWidth={3} />}
            </button>
          </div>
        </form>

        {/* REDIRECT ACCESS LINK MATRIX */}
        <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
          <p className="text-[10px] font-black  tracking-widest text-zinc-500">
            ALREADY IN THE ACTIVE FEDERATION LOGSHEETS?
          </p>
          <Link
            to="/login"
            className="inline-block mt-2 text-xs font-black  tracking-wider text-[#CCFF00] hover:text-white underline decoration-2 underline-offset-4"
          >
            ENGAGE EXISTING ATHLETE SESSION
          </Link>
        </div>

      </div>
    </div>
  );
}
