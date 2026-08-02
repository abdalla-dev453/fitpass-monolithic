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
      { label: "ELITE STUDIOS", to: "/studios" }, // Fixed typo: STUODIOS -> STUDIOS
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
    <footer className="w-full bg-[#0B0B0C] text-[#F3F4F6] border-t border-[#1F2937]/50 pt-24 pb-8 overflow-hidden font-sans select-none selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto px-6 md:px-12 relative z-10">
        
        {/* UPPER ROW: COHESIVE INTERACTIVE DISTRIBUTION GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 pb-20 border-b border-[#1F2937]/40">
          
          {/* BRAND AXIS BOX */}
          <div className="lg:col-span-5 flex flex-col justify-between space-y-8">
            <div className="space-y-5 max-w-sm">
              <Link to="/" className="inline-flex items-center gap-2.5 tracking-tighter group">
                <span className="flex h-8 w-8 items-center justify-center bg-[#CCFF00] text-black font-black transition-all duration-300 group-hover:rotate-90 group-hover:scale-105">
                  <Activity size={16} strokeWidth={3} />
                </span>
                <span className="font-display font-black text-2xl uppercase tracking-tighter text-white">
                  FIT<span className="text-[#CCFF00]">PASS</span>
                </span>
              </Link>
              
              <p className="text-gray-400 text-xs font-medium leading-relaxed tracking-wider">
                ONE INTEGRATED CONTRACT-FREE ACCESS DEPLOYMENT FOR EVERY ELITE BOX, POWER LOFT, AND HIIT STATION IN THE METROPOLIS.
              </p>
            </div>

            {/* HIGH-END INTERACTIVE SOCIAL LINKS */}
            <div className="flex items-center gap-3">
              {[SiInstagram, SiX, SiFacebook, SiYoutube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-10 w-10 border border-[#1F2937]/60 bg-zinc-950/40 rounded-lg flex items-center justify-center text-gray-400 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_4px_12px_rgba(204,255,0,0.15)]"
                  aria-label="Network out-link"
                >
                  <Icon size={14} />
                </a>
              ))}
            </div>
          </div>

          {/* UTILITY COLUMNS CLUSTER (ASYMMETRICAL BACKBONE) */}
          <div className="lg:col-span-7 grid grid-cols-2 md:grid-cols-3 gap-10">
            {COLUMNS.map((col) => (
              <div key={col.title} className="last:col-span-2 last:md:col-span-1">
                <h4 className="text-xs font-bold tracking-[0.2em] uppercase text-gray-500 mb-6">
                  {col.title}
                </h4>
                <ul className="space-y-4">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="group text-xs font-bold tracking-widest text-gray-400 hover:text-white flex items-center transition-colors duration-200"
                      >
                        <span className="text-[#CCFF00] max-w-0 opacity-0 transform -translate-x-2 transition-all duration-300 group-hover:max-w-[12px] group-hover:opacity-100 group-hover:translate-x-0 mr-1.5 text-xs">
                          →
                        </span>
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

        </div>

        {/* INTERMEDIATE CONVERSION HUB (NEWSLETTER TERMINAL) */}
        <div className="py-14 border-b border-[#1F2937]/40 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-10">
          <div className="max-w-xl">
            <h4 className="font-display font-black text-2xl uppercase tracking-tight text-white leading-none">
              JOIN THE WEEKLY CLASS DROP
            </h4>
            <p className="mt-3 text-xs font-medium tracking-wider text-gray-400">
              SECURE PRIORITY SCHEDULE DEPLOYMENTS AND NEW BOX ANNOUNCEMENTS. NO SPAM. ZERO FLUFF.
            </p>
          </div>

          {/* FLUID PREMIUM CONVERSION BOX */}
          <form 
            onSubmit={handleSubmit} 
            className="flex w-full max-w-md border border-[#1F2937] bg-zinc-950/30 rounded-xl p-1.5 focus-within:border-[#CCFF00]/50 transition-colors duration-300"
          >
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ENTER OPERATIONAL EMAIL"
              className="flex-1 bg-transparent px-3 py-2 text-xs font-bold tracking-widest text-white placeholder:text-zinc-700 focus:outline-none uppercase"
            />
            <button
              type="submit"
              className="shrink-0 inline-flex items-center justify-center bg-[#CCFF00] text-black h-9 w-12 rounded-lg font-display font-black text-xs uppercase tracking-widest hover:bg-white transition-all duration-300"
            >
              {submitted ? <Check size={15} strokeWidth={3} /> : <ArrowRight size={15} strokeWidth={3} />}
            </button>
          </form>
        </div>

        {/* LARGE TYPOGRAPHIC STATEMENT ENGINE */}
        <div className="py-10 select-none relative group">
          <div className="absolute inset-0 bg-gradient-to-r from-[#CCFF00]/0 via-[#CCFF00]/3 to-[#CCFF00]/0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 blur-2xl pointer-events-none" />
          <h1 className="text-center font-black text-[12vw] sm:text-[14vw] md:text-[15vw] leading-none tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-[#18181B] to-[#0B0B0C] transition-all duration-750 group-hover:from-white group-hover:to-[#18181B]">
            FITPASS
          </h1>
        </div>

        {/* BOTTOM METADATA LEDGER */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-between gap-6 text-[10px] font-bold tracking-widest text-gray-500 uppercase border-t border-[#1F2937]/20 pt-6">
          <p>© {new Date().getFullYear()} FITPASS COMPREHENSIVE NETWORK. SYSTEM ENFORCED.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-white transition-colors relative group">
              PRIVACY POLICY
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gray-500 transition-all duration-200 group-hover:w-full" />
            </a>
            <a href="#" className="hover:text-white transition-colors relative group">
              TERMS OF DISPATCH
              <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-gray-500 transition-all duration-200 group-hover:w-full" />
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
}
