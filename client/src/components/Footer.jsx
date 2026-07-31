import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowRight, Check } from "lucide-react";
// Ensure this package import is complete and includes all four brand tokens
import { SiInstagram, SiX, SiFacebook, SiYoutube } from "@icons-pack/react-simple-icons";

const COLUMNS = [
  {
    title: "THE NETWORK",
    links: [
      { label: "BROWSE SESSIONS", to: "/classes" },
      { label: "ELITE STUODIOS", to: "/studios" },
      { label: "PRICING PLANS", to: "/pricing" },
      { label: "ABOUT THE PASS", to: "/about" },
    ],
  },
  {
    title: "FEDERATION",
    links: [
      { label: "OUR BLUEPRINT", to: "/about" },
      { label: "CAREERS LAB", to: "#" },
      { label: "PRESS DEPOT", to: "#" },
      { label: "COMM-LINKS", to: "#" },
    ],
  },
  {
    title: "SUPPORT AXIS",
    links: [
      { label: "HELP ENGINE", to: "#" },
      { label: "CANCELLATION POLICY", to: "/pricing" },
      { label: "SAFETY MANIFESTO", to: "/about" },
      { label: "PARTNER PORTAL", to: "#" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    window.setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <footer className="relative border-t-4 border-zinc-900 bg-[#0B0C10] text-white select-none overflow-hidden bg-gym-grid">
      
      {/* GIANT REAR BACKGROUND DESIGN LAYER — THE MARK OF PREMIUM LAYOUTS */}
      <div className="absolute -bottom-10 right-0 font-display text-[15rem] leading-none font-black tracking-tighter text-zinc-900/10 pointer-events-none select-none uppercase z-0">
        FITPASS
      </div>

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 pt-20 pb-12 z-10">
        
        {/* UPPER DISTRIBUTION GRID */}
        <div className="grid lg:grid-cols-[1.5fr,1fr,1fr,1fr] gap-12 pb-16 border-b-2 border-zinc-900">
          
          {/* BRAND AXIS BOX */}
          <div className="flex flex-col justify-between">
            <div>
              <Link to="/" className="flex items-center gap-2 tracking-tighter group">
                <span className="flex h-8 w-8 items-center justify-center bg-[#CCFF00] text-black font-black transition-transform duration-150 group-hover:scale-105">
                  <Activity size={18} strokeWidth={3} />
                </span>
                <span className="font-display font-black text-2xl uppercase tracking-tight text-white">
                  FIT<span className="text-[#CCFF00]">PASS</span>
                </span>
              </Link>
              
              <p className="mt-5 text-xs font-bold uppercase tracking-wider text-zinc-400 leading-relaxed max-w-xs">
                ONE INTEGRATED CONTRACT-FREE ACCESS DEPLOYMENT FOR EVERY ELITE BOX, POWER LOFT, AND HIIT STATION IN THE METROPOLIS.
              </p>
            </div>

            {/* RAW BOXED GEOMETRIC SOCIAL FRAMES */}
            <div className="mt-8 flex items-center gap-2">
              {[SiInstagram, SiX, SiFacebook, SiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 border border-zinc-800 bg-zinc-950 flex items-center justify-center text-zinc-500 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] transition-all duration-150 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-0.5 hover:translate-y-0.5"
                  aria-label="Network out-link"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* UTILITY COLUMNS CLUSTER */}
          {COLUMNS.map((col) => (
            <div key={col.title} className="border-l-2 border-zinc-900 pl-6 lg:pl-8 first:border-l-0 first:pl-0">
              <h4 className="font-display font-black text-sm text-[#CCFF00] tracking-widest uppercase">
                {col.title}
              </h4>
              <ul className="mt-5 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="inline-block text-xs font-black tracking-widest text-zinc-400 hover:text-white transition-all duration-100 hover:translate-x-1 uppercase relative group"
                    >
                      {link.label}
                      <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#CCFF00] transition-all duration-150 group-hover:w-full" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* INTERMEDIATE CONVERSION HUB (NEWSLETTER TERMINAL) */}
        <div className="py-12 border-b-2 border-zinc-900 flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div>
            <h4 className="font-display font-black text-2xl uppercase tracking-tight text-white leading-none">
              JOIN THE WEEKLY CLASS DROP
            </h4>
            <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
              SECURE PRIORITY SCHEDULE DEPLOYMENTS AND NEW BOX ANNOUNCEMENTS. NO SPAM. ZERO FLUFF.
            </p>
          </div>

          {/* HEAVY ANGLING INPUT GRID ROW */}
          <form onSubmit={handleSubmit} className="flex w-full max-w-md border-2 border-zinc-800 bg-zinc-950 p-1.5 shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER OPERATIONAL EMAIL"
              className="flex-1 bg-transparent px-3 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
            />
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center bg-[#CCFF00] text-black h-9 px-6 font-display font-black text-xs uppercase tracking-widest hover:bg-white transition-colors"
            >
              {submitted ? <Check size={16} strokeWidth={3} /> : <ArrowRight size={16} strokeWidth={3} />}
            </button>
          </form>
        </div>

        {/* BOTTOM LEDGER REGISTRATION */}
        <div className="mt-12 flex flex-col-reverse sm:flex-row items-center justify-between gap-6 text-[10px] font-black tracking-widest text-zinc-500 uppercase">
          <p>© {new Date().getFullYear()} FITPASS COMPREHENSIVE NETWORK. SYSTEM ENFORCED.</p>
          <div className="flex gap-6 border-zinc-900">
            <a href="#" className="hover:text-white transition-colors relative group">
              PRIVACY POLICY
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-500 transition-all duration-150 group-hover:w-full" />
            </a>
            <a href="#" className="hover:text-white transition-colors relative group">
              TERMS OF DISPATCH
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-zinc-500 transition-all duration-150 group-hover:w-full" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
