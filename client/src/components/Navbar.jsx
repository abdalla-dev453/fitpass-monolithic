import React from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { Menu, X, LogOut, User as UserIcon, ShieldAlert } from "lucide-react";

export default function Navbar() {
  const { user, logout, mobileMenuOpen, setMobileMenuOpen } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate("/");
  };

  // Base navigation schema with visibility parameters mapped to clearance levels
  const navLinks = [
    { path: "/", label: "HOME", visible: true },
    { path: "/about", label: "ABOUT", visible: true },
    { path: "/pricing", label: "PRICING", visible: true },
    
    // Protected Routes - require login, open to everyone logged in
    { path: "/studios", label: "STUDIOS", visible: !!user },
    
    // Trainer or Admin clearance flags
    { 
      path: "/classes", 
      label: "CLASSES COMMAND", 
      visible: user && ["trainer", "admin"].includes(user.role) 
    },
    
    // Strict admin override route placeholder
    { 
      path: "/admin-dashboard", 
      label: "CORE CONTROL", 
      visible: user && user.role === "admin" 
    },
  ];

  // Filtering out active links for current compilation matching state
  const visibleLinks = navLinks.filter(link => link.visible);

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#0B0B0C]/80 backdrop-blur-xl border-b border-zinc-800/40 px-6 md:px-12 py-4 select-none selection:bg-[#CCFF00] selection:text-black">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* BRAND IDENTITY NODE */}
        <Link 
          to="/" 
          className="font-display font-black text-2xl uppercase tracking-tighter text-white transition-transform duration-300 hover:scale-[1.02]"
        >
          FIT<span className="text-[#CCFF00]">PASS</span><span className="text-zinc-500 font-normal">.</span>
        </Link>

        {/* DESKTOP MATRIX ROUTE NAVIGATOR */}
        <div className="hidden md:flex items-center gap-8 bg-zinc-950/40 border border-zinc-800/40 px-6 py-2 rounded-full shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[10px] font-bold uppercase tracking-[0.2em] transition-all duration-300 relative group py-1 ${
                  isActive ? "text-[#CCFF00]" : "text-gray-400 hover:text-white"
                }`}
              >
                {link.label}
                {/* Micro underline indicator bar */}
                <span className={`absolute bottom-0 left-1/2 -translate-x-1/2 h-[2px] bg-[#CCFF00] transition-all duration-300 ${
                  isActive ? "w-4 rounded-full" : "w-0 group-hover:w-2 rounded-full"
                }`} />
              </Link>
            );
          })}
        </div>

        {/* IDENTITY AND SESSION OPERATIONS CORNER */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4 bg-zinc-950/30 border border-zinc-800/40 pl-4 pr-2 py-1.5 rounded-xl">
              {/* CLEARANCE VISUAL ANCHOR CHIP */}
              <div className="flex flex-col items-end pr-2 border-r border-zinc-800/60">
                <span className="text-[10px] font-bold text-gray-200 uppercase tracking-wider">{user.name}</span>
                <span className="text-[7px] font-black text-[#CCFF00] tracking-[0.15em] uppercase mt-0.5">
                  {user.role === "user" ? "ATHLETE" : user.role}
                </span>
              </div>
              
              <div className="flex items-center gap-2">
                <Link 
                  to="/profile" 
                  className="p-2 border border-zinc-800/80 bg-zinc-900/40 text-gray-400 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] rounded-lg transition-all duration-300 shadow-sm"
                >
                  <UserIcon size={13} strokeWidth={2.5} />
                </Link>
                
                <button
                  onClick={handleLogout}
                  className="p-2 border border-red-950 bg-red-950/10 text-red-400 hover:bg-red-500 hover:text-white hover:border-red-500 rounded-lg transition-all duration-300 shadow-sm"
                >
                  <LogOut size={13} strokeWidth={2.5} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 hover:text-white px-4 py-2 transition-colors duration-200"
              >
                ACCESS SESSION
              </Link>
              <Link
                to="/register"
                className="text-[10px] font-black uppercase tracking-[0.15em] bg-[#CCFF00] text-black hover:bg-white px-5 py-2.5 rounded-xl border border-transparent transition-all duration-300 shadow-[0_4px_20px_rgba(204,255,0,0.15)] hover:shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:-translate-y-0.5 active:translate-y-0"
              >
                FORGE PASSPORT
              </Link>
            </div>
          )}
        </div>

        {/* RESPONSIVE RESPONDER MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 border border-zinc-800 bg-zinc-950/40 rounded-xl text-gray-400 hover:text-white transition-all duration-200"
        >
          {mobileMenuOpen ? <X size={15} strokeWidth={2.5} /> : <Menu size={15} strokeWidth={2.5} />}
        </button>

      </div>

      {/* MOBILE EXPANDED MENU DRAWER DISPATCH OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%+1px)] left-0 w-full bg-[#0B0B0C]/95 backdrop-blur-2xl border-b border-zinc-800/60 p-6 space-y-6 flex flex-col animate-in slide-in-from-top-4 duration-300 ease-out">
          
          <div className="flex flex-col gap-3">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-xs font-bold uppercase tracking-[0.15em] py-2 px-3 rounded-lg transition-colors duration-200 ${
                    isActive ? "text-[#CCFF00] bg-zinc-900/40" : "text-gray-400 hover:text-white hover:bg-zinc-900/20"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* INTERNAL ACCOUNT CONSOLE DRAWER ASSIGNMENT */}
          <div className="pt-5 border-t border-zinc-800/60 flex flex-col gap-3">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-950/40 p-3.5 border border-zinc-800/60 rounded-xl">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-bold uppercase text-gray-200 tracking-wide">{user.name}</span>
                    <span className="text-[8px] font-black tracking-widest text-[#CCFF00] uppercase mt-0.5">{user.role} INTERFACE</span>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] font-bold uppercase text-[#CCFF00] hover:text-white transition-colors underline underline-offset-4"
                  >
                    PROFILE
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 border border-red-950/60 bg-red-950/20 hover:bg-red-500 hover:text-white transition-all duration-300 text-red-400 py-3 rounded-xl text-[10px] font-bold uppercase tracking-widest"
                >
                  <LogOut size={12} strokeWidth={2.5} /> TERMINATE SECTOR AUTHORIZATION
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border border-zinc-800/80 bg-zinc-950/20 text-gray-300 font-bold uppercase tracking-widest py-3 rounded-xl text-[10px] hover:text-white hover:border-zinc-700 transition-colors duration-200"
                >
                  ACCESS GATEWAY
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#CCFF00] text-black font-black uppercase tracking-widest py-3 rounded-xl text-[10px] hover:bg-white shadow-[0_4px_12px_rgba(204,255,0,0.1)] transition-all duration-200"
                >
                  INITIALIZE ACCOUNT PASSPORT
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}
