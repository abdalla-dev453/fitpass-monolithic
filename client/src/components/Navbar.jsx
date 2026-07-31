import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { Activity, Menu, X, User, LogOut, LogIn, UserPlus } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

const LINKS = [
  { label: "CLASSES", to: "/classes" },
  { label: "STUDIOS", to: "/studios" },
  { label: "PRICING PLANS", to: "/pricing" },
  { label: "ABOUT US", to: "/about" },
];

export default function Navbar() {
  const { mobileMenuOpen, setMobileMenuOpen, user, logout } = useApp();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const handleNavClick = () => setMobileMenuOpen(false);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-150 select-none ${
        scrolled
          ? "bg-[#0B0C10] border-b-2 border-zinc-800 shadow-[0_4px_20px_rgba(0,0,0,0.8)]"
          : "bg-gradient-to-b from-black/80 to-transparent border-b-2 border-transparent"
      }`}
    >
      {/* 
        LAYOUT CHANGE: Changed px-6 lg:px-8 to pl-6 lg:pl-8 pr-0 
        This allows the slanted background to touch the right edge of the browser screen perfectly.
      */}
      <nav className="max-w-7xl mx-auto pl-6 lg:pl-8 pr-0 flex items-center justify-between h-16 md:h-20 relative">
        {/* HARD ATHLETIC BRAND LOGO BLOCK */}
        <Link to="/" className="flex items-center gap-2 group tracking-tighter z-10">
          <span className="flex h-8 w-8 items-center justify-center bg-[#CCFF00] text-black font-black transition-transform duration-100 group-hover:scale-105">
            <Activity size={18} strokeWidth={3} />
          </span>
          <span className="font-display font-black text-2xl uppercase tracking-tight text-white">
            FIT<span className="text-[#CCFF00]">PASS</span>
          </span>
        </Link>

        {/* 
          LAYOUT CHANGE: Centered the link container to match the image.
          Using absolute positioning locks it perfectly to the middle of the viewport.
        */}
        <div className="hidden md:flex absolute inset-0 items-center justify-center pointer-events-none">
          <div className="flex items-center gap-8 h-full pointer-events-auto">
            {LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `text-xs font-black uppercase tracking-widest relative h-full flex items-center border-b-2 transition-all duration-150 ${
                    isActive
                      ? "text-[#CCFF00] border-[#CCFF00]"
                      : "text-zinc-400 border-transparent hover:text-white hover:border-zinc-700"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* 
          LAYOUT CHANGE: Added the slanted login block container.
          This houses the background shape and pads the original login controls inside it.
        */}
        <div className="hidden md:flex items-center h-full relative z-10">
          {/* The Slanted Shape (Skewed background block matching the layout style) */}
          <div 
            className="absolute inset-y-0 -left-6 w-[calc(100%+24px)] bg-[#a81414] -skew-x-[20deg] origin-top-right border-l-4 border-red-600"
            style={{ content: '""' }}
          />
          
          {/* USER EXPERIENCE ACTION TERMINAL (Kept exactly your controls & colors) */}
          <div className="relative flex items-center gap-4 h-full px-8 pr-12">
            {user ? (
              <div className="flex items-center gap-4">
                {/* Profile Overview Pill Block */}
                <div className="flex items-center gap-2 border border-zinc-800 bg-zinc-950 px-3 py-1.5 rounded-none">
                  <User size={14} className="text-[#CCFF00]" />
                  <span className="text-[10px] font-black uppercase tracking-wider text-zinc-300">
                    {user.name || "ATHLETE"}
                  </span>
                </div>
                {/* Direct Tactical Logout Switch */}
                <button
                  onClick={logout}
                  className="h-8 w-8 border border-zinc-800 text-zinc-600 hover:text-red-500 hover:border-red-900 flex items-center justify-center transition-colors"
                  title="LOGOUT SESSION"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              /* HIGH-CONTRAST DUAL GATEWAY CONTROLS */
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-white transition-colors py-2 px-3"
                >
                  <LogIn size={13} strokeWidth={2.5} className="text-[#CCFF00]" />
                  LOGIN
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center bg-[#CCFF00] text-black font-display font-black text-xs uppercase tracking-widest px-5 py-2 border-2 border-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] transition-colors"
                >
                  REGISTER
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* GEOMETRIC MOBILE ACTION BUTTON */}
        <div className="md:hidden flex items-center pr-6 z-10">
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center h-10 w-10 border border-zinc-800 bg-zinc-950 text-white rounded-none hover:border-[#CCFF00] transition-colors"
            aria-label={mobileMenuOpen ? "CLOSE MENU" : "OPEN MENU"}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? (
              <X size={20} strokeWidth={2.5} />
            ) : (
              <Menu size={20} strokeWidth={2.5} />
            )}
          </button>
        </div>
      </nav>

      {/* SOLID PERFORMANCE MOBILE PANEL SLIDE DROPDOWN */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ease-out border-zinc-800 bg-[#0B0C10] ${
          mobileMenuOpen ? "max-h-[480px] border-b-2" : "max-h-0"
        }`}
      >
        <div className="px-6 pb-8 pt-4 flex flex-col gap-1.5">
          {LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `py-3 text-sm font-black uppercase tracking-widest border-b border-zinc-900 last:border-0 ${
                  isActive ? "text-[#CCFF00]" : "text-zinc-400 hover:text-white"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}

          {/* Mobile Profile Display / Gateway Switcher */}
          {user ? (
            <div className="mt-4 pt-4 border-t-2 border-zinc-900 flex items-center justify-between">
              <span className="text-xs font-black uppercase text-zinc-400 tracking-wider">
                ACTIVE ATHLETE:{" "}
                <span className="text-white ml-1">{user.name}</span>
              </span>
              <button
                onClick={() => {
                  handleNavClick();
                  logout();
                }}
                className="text-xs font-black uppercase text-red-500 tracking-wider hover:underline"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <div className="mt-6 pt-4 border-t-2 border-zinc-900 flex flex-col gap-3">
              <Link
                to="/login"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-2 font-display font-black text-xs uppercase tracking-widest py-3 border-2 border-zinc-800 text-white bg-zinc-950 hover:border-white transition-colors"
              >
                <LogIn size={14} strokeWidth={2.5} className="text-[#CCFF00]" />
                LOGIN ACCOUNT
              </Link>
              <Link
                to="/register"
                onClick={handleNavClick}
                className="flex items-center justify-center gap-2 font-display font-black text-xs uppercase tracking-widest py-3 bg-[#CCFF00] text-black border-2 border-[#CCFF00]"
              >
                <UserPlus size={14} strokeWidth={2.5} />
                REGISTER NEW PASS
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
