import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { ArrowRight, ShieldAlert, User, Mail, KeyRound } from "lucide-react";
import api from "../lib/api.js";

export default function Register() {
  const { showToast } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await api.register(form);
      localStorage.setItem("fitpass_token", data.access_token); // Automatically claim bearer tokens on system initialization
      showToast("PASSPORT DEPLOYED SUCCESSFULLY. WELCOME ATHLETE.");
      window.location.href = "/classes"; // Force system update
    } catch (err) {
      setError(err.message || "DISPATCH REGISTRATION DENIED. CRITICAL PIPELINE INVALID REQUISITE.");
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
            <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans font-black tracking-widest text-[9px] uppercase px-3 py-1">
              PIPELINE ACCOUNT DISPATCH
            </span>
          </div>
          <h2 className="font-display font-black text-3xl uppercase tracking-tighter text-white">
            DEPLOY ACCELERATOR <span className="text-[#CCFF00]">PASS.</span>
          </h2>
        </div>

        {/* COMPREHENSIVE CRASH ALERTS SCREEN */}
        {error && (
          <div className="mt-6 border border-red-900 bg-red-950/40 p-4 flex items-center gap-3">
            <ShieldAlert size={16} className="text-red-500 shrink-0" strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-red-400 leading-normal">
              {error}
            </p>
          </div>
        )}

        {/* INPUT DISPATCH FORM CHASSIS */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          
          {/* ATHLETE NAME ALLOCATION FIELD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">ATHLETE FULL IDENTIFIER CALLSIGN</label>
            <div className="relative border-2 border-zinc-800 bg-zinc-900 p-1 focus-within:border-[#CCFF00] transition-colors duration-100">
              <User size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
              <input
                type="text"
                required
                disabled={loading}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value.toUpperCase() })}
                placeholder="ENTER FULL NAME CALLSIGN"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* EMAIL ALLOCATION FIELD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SYSTEM COMMUNICATION CHANNELS</label>
            <div className="relative border-2 border-zinc-800 bg-zinc-900 p-1 focus-within:border-[#CCFF00] transition-colors duration-100">
              <Mail size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
              <input
                type="email"
                required
                disabled={loading}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value.toUpperCase() })}
                placeholder="ENTER UNIQUE EMAIL INTEL"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* PASSWORD LOCK ALLOCATION FIELD */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">SECURITY CODE ACCESS CREATION</label>
            <div className="relative border-2 border-zinc-800 bg-zinc-900 p-1 focus-within:border-[#CCFF00] transition-colors duration-100">
              <KeyRound size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" strokeWidth={2.5} />
              <input
                type="password"
                required
                disabled={loading}
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                placeholder="CREATE ENCRYPTED PASSPHRASE"
                className="w-full bg-transparent pl-9 pr-3 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* PRIMARY DEPLOYMENT ACTION BUTTON */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-primary disabled:bg-zinc-900 disabled:border-zinc-900 disabled:text-zinc-600 disabled:cursor-not-allowed"
            >
              {loading ? "COMMENCING GENERATION CHANNELS..." : "GENERATE PASS ACCOUNT"}
              {!loading && <ArrowRight size={14} strokeWidth={3} />}
            </button>
          </div>
        </form>

        {/* REDIRECT ACCESS LINK MATRIX */}
        <div className="mt-8 pt-4 border-t border-zinc-900 text-center">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
            ALREADY SECURED AN ACTIVE PASSPORT LINK ON OUR SYSTEM?
          </p>
          <Link
            to="/login"
            className="inline-block mt-2 text-xs font-black uppercase tracking-wider text-[#CCFF00] hover:text-white underline decoration-2 underline-offset-4"
          >
            ACCESS PRE-EXISTING ACCOUNT LOGINS
          </Link>
        </div>

      </div>
    </div>
  );
}
