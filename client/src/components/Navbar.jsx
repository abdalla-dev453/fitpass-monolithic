import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Activity, Menu, X } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

const LINKS = [
  { label: "Classes", to: "/classes" },
  { label: "Studios", to: "/studios" },
  { label: "Pricing", to: "/pricing" },
  { label: "About", to: "/about" },
];

export default function Navbar() {
  const { mobileMenuOpen, setMobileMenuOpen } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-slate-950/70 backdrop-blur-xl border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-6 lg:px-8 flex items-center justify-between h-16 md:h-20">
        <Link to="/" className="flex items-center gap-2 group">
          <span className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-400/30 group-hover:border-emerald-400/60 transition-colors">
            <Activity className="text-emerald-400" size={18} />
          </span>
          <span className="font-display font-bold text-lg tracking-tight text-white">
            Fit<span className="text-emerald-400">Pass</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-9">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive ? "text-white" : "text-slate-300 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <Link to="/pricing" className="btn-primary !px-5 !py-2.5 text-sm">
            Get Your Pass
          </Link>
        </div>

        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden inline-flex items-center justify-center h-10 w-10 rounded-lg text-slate-200 hover:bg-white/5 transition-colors"
          aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          aria-expanded={mobileMenuOpen}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile drawer */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          mobileMenuOpen ? "max-h-96 border-b border-white/10" : "max-h-0"
        }`}
      >
        <div className="bg-slate-950/95 backdrop-blur-xl px-6 pb-6 pt-2 flex flex-col gap-1">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `py-3 text-base font-medium border-b border-white/5 last:border-0 ${
                  isActive ? "text-white" : "text-slate-200"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
          <Link
            to="/pricing"
            onClick={handleNavClick}
            className="mt-4 text-center text-sm font-semibold px-5 py-3 rounded-full bg-emerald-400 text-slate-950"
          >
            Get Your Pass
          </Link>
        </div>
      </div>
    </header>
  );
}