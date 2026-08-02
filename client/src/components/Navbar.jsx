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
    <nav className="fixed top-0 left-0 w-full z-50 bg-zinc-950/90 backdrop-blur-md border-b-2 border-zinc-900 px-4 md:px-8 py-4 select-none">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        
        {/* BRAND IDENTITY NODE */}
        <Link 
          to="/" 
          className="font-display font-black text-2xl uppercase tracking-tighter text-white hover:opacity-90"
        >
          FIT<span className="text-[#CCFF00]">PASS.</span>
        </Link>

        {/* DESKTOP MATRIX ROUTE NAVIGATOR */}
        <div className="hidden md:flex items-center gap-6">
          {visibleLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`text-[10px] font-black uppercase tracking-widest transition-colors duration-100 ${
                  isActive ? "text-[#CCFF00]" : "text-zinc-400 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        {/* IDENTITY AND SESSION OPERATIONS CORNER */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              {/* CLEARANCE VISUAL ANCHOR CHIP */}
              <div className="flex flex-col items-end">
                <span className="text-[10px] font-black text-white uppercase tracking-wider">{user.name}</span>
                <span className="text-[7px] font-black bg-zinc-900 border border-zinc-800 text-[#CCFF00] px-1.5 py-0.5 rounded-none tracking-widest uppercase">
                  {user.role === "user" ? "ATHLETE" : user.role}
                </span>
              </div>
              
              <Link 
                to="/profile" 
                className="p-2 border-2 border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-[#CCFF00] hover:border-[#CCFF00] transition-colors"
              >
                <UserIcon size={14} strokeWidth={2.5} />
              </Link>
              
              <button
                onClick={handleLogout}
                className="p-2 border-2 border-red-900/30 bg-red-950/20 text-red-400 hover:bg-red-950/50 hover:border-red-500 transition-colors"
              >
                <LogOut size={14} strokeWidth={2.5} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-white px-3 py-1.5"
              >
                ACCESS SESSION
              </Link>
              <Link
                to="/register"
                className="text-[10px] font-black uppercase tracking-widest bg-[#CCFF00] text-black hover:bg-white px-4 py-2 border border-transparent shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none transition-all duration-150"
              >
                FORGE PASSPORT
              </Link>
            </div>
          )}
        </div>

        {/* RESPONSIVE RESPONDER MOBILE MENU TOGGLE */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-1.5 border-2 border-zinc-800 text-zinc-400 hover:text-white"
        >
          {mobileMenuOpen ? <X size={16} strokeWidth={2.5} /> : <Menu size={16} strokeWidth={2.5} />}
        </button>

      </div>

      {/* MOBILE EXPANDED MENU DRAWER DISPATCH OVERLAY */}
      {mobileMenuOpen && (
        <div className="md:hidden absolute top-[calc(100%+2px)] left-0 w-full bg-zinc-950 border-b-2 border-zinc-900 p-6 space-y-6 flex flex-col animate-in slide-in-from-top-4 duration-150">
          
          <div className="flex flex-col gap-4">
            {visibleLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`text-xs font-black uppercase tracking-widest py-1 ${
                    isActive ? "text-[#CCFF00]" : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </div>

          {/* INTERNAL ACCOUNT CONSOLE DRAWER ASSIGNMENT */}
          <div className="pt-4 border-t border-zinc-900 flex flex-col gap-3">
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-zinc-900/60 p-3 border border-zinc-800">
                  <div className="flex flex-col">
                    <span className="text-[11px] font-black uppercase text-white">{user.name}</span>
                    <span className="text-[8px] font-black tracking-widest text-zinc-500 uppercase mt-0.5">{user.role} INTERFACE ACTIVE</span>
                  </div>
                  <Link 
                    to="/profile" 
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-[10px] font-black uppercase text-[#CCFF00] underline"
                  >
                    PROFILE
                  </Link>
                </div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 border-2 border-red-950 bg-red-950/20 text-red-400 py-2.5 text-[10px] font-black uppercase tracking-widest"
                >
                  <LogOut size={12} strokeWidth={2.5} /> TERMINATE SECTOR AUTHORIZATION
                </button>
              </div>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center border-2 border-zinc-800 text-zinc-400 font-black uppercase tracking-widest py-2.5 text-[10px]"
                >
                  ACCESS GATEWAY
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center bg-[#CCFF00] text-black font-black uppercase tracking-widest py-2.5 text-[10px]"
                >
                  INITIALIZE NEW ACCOUNT PASSPORT
                </Link>
              </div>
            )}
          </div>

        </div>
      )}
    </nav>
  );
}
