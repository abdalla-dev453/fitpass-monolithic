import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Play, MapPin, Users, Star, CreditCard } from "lucide-react";
import gymBanner from "../assets/hero_banner.jpeg";

const STATS = [
  { label: "PARTNER BOXES", value: "50+" },
  { label: "WEEKLY SLOTS", value: "1,200+" },
  { label: "NETWORK RATING", value: "4.9/5" },
];

export default function HeroSection() {
  return (
    <section 
      className="relative overflow-hidden min-h-screen flex items-center select-none border-b-2 border-zinc-900 bg-gym-grid text-white"
      style={{
        backgroundImage: `linear-gradient(to right, rgba(11, 12, 16, 0.98) 5%, rgba(11, 12, 16, 0.5) 75%), url(${gymBanner})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-[1.2fr,0.8fr] gap-12 items-center z-20 w-full py-24">
        
        {/* LEFT COPY COLUMN */}
        <div className="flex flex-col justify-center">
          <div className="inline-flex mb-4">
            <span className="bg-[#CCFF00] text-black font-sans font-black tracking-widest text-[10px] uppercase px-3 py-1.5 border border-black">
              ONE PASS. EVERY DISCIPLINE BOX.
            </span>
          </div>

          <h1 className="font-display text-white text-4xl sm:text-5xl lg:text-[3.0rem] leading-[0.85] uppercase tracking-tighter">
            YOUR BODY IS <br />
            CAPABLE OF <br />
            <span className="text-[#CCFF00]">AMAZING THINGS.</span>
          </h1>

          <p className="mt-6 text-[11px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400 max-w-md leading-relaxed border-l-2 border-[#CCFF00] pl-4">
            FitPass unlocks every elite yoga studio, intensive HIIT box, and high-performance 
            Pilates loft across the metropolitan network. One integrated tracking membership, 
            zero lock-in deposit contracts. Find your station, check live openings, and book in 10 seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/pricing" className="btn-primary group">
              GET YOUR PASS
              <ArrowRight size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
            </Link>
            <Link 
              to="/classes" 
              className="inline-flex items-center justify-center gap-2 border-2 border-zinc-800 bg-zinc-950/60 backdrop-blur-sm px-8 py-3.5 font-display text-sm font-black uppercase text-white tracking-widest hover:border-[#CCFF00] hover:text-[#CCFF00] transition-colors"
            >
              <Play size={14} fill="currentColor" className="text-[#CCFF00]" />
              BROWSE SESSIONS
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-3 gap-6 max-w-md border-t-2 border-zinc-900 pt-8">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-black text-2xl sm:text-4xl text-white tracking-tight leading-none">
                  {stat.value}
                </div>
                <div className="mt-2 text-[9px] font-black uppercase tracking-wider text-zinc-500 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT VISUAL COLUMN: Consolidated Unified Industrial Control Terminal Panel */}
        <div className="hidden lg:flex flex-col border-2 border-zinc-800 bg-zinc-950/95 shadow-[8px_8px_0px_0px_rgba(204,255,0,1)] p-6 gap-6 max-w-md w-full justify-self-end">
          
          {/* Module 1: Live Status Header */}
          <div className="flex items-center justify-between border-b-2 border-zinc-900 pb-4">
            <div className="flex items-center gap-2">
              <span className="flex h-2 w-2 bg-[#CCFF00] animate-ping rounded-none" />
              <h3 className="font-display font-black text-md text-white tracking-wide uppercase">
                STATION RUNTIME TERMINAL
              </h3>
            </div>
            <span className="text-[9px] font-black tracking-widest text-zinc-500 uppercase">SYS_ONLINE</span>
          </div>

          {/* Module 2: Metric Credit Balance */}
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CreditCard size={16} className="text-[#CCFF00]" strokeWidth={2.5} />
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">ATHLETE BALANCE STATUS</span>
            </div>
            <span className="font-display font-black text-2xl text-white">8 <span className="text-[10px] text-zinc-500">CREDITS</span></span>
          </div>

          {/* Module 3: Upcoming Session Content Container */}
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 space-y-3">
            <div className="flex items-center justify-between text-[9px] font-black text-zinc-500 tracking-widest border-b border-zinc-900 pb-2">
              <span>NEXT SCHEDULE DISPATCH</span>
              <span className="flex items-center gap-1"><MapPin size={10} /> DOWNTOWN</span>
            </div>
            <h4 className="font-display font-black text-lg text-white uppercase leading-none tracking-tight">
              SUNRISE VINYASA INTENSITY
            </h4>
            <div className="flex items-center justify-between pt-1">
              <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">ZEN FLOW LOFT · 07:00 AM</span>
              <span className="text-[10px] font-black text-[#CCFF00] uppercase tracking-widest flex items-center gap-1">
                <Users size={11} /> 4 SPOTS
              </span>
            </div>
            <button className="w-full mt-2 bg-[#CCFF00] text-black font-display font-black text-xs uppercase py-2.5 hover:bg-white transition-colors border border-black">
              EXECUTE RESERVATION BOOKING
            </button>
          </div>

          {/* Module 4: Coach Performance Validation */}
          <div className="border border-zinc-800 bg-zinc-900/40 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-black text-[#CCFF00] text-xs">
                MR
              </div>
              <div>
                <p className="text-xs font-display font-black text-white uppercase tracking-tight">MAYA RIVERA</p>
                <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">HIIT HEAD TRAINER</p>
              </div>
            </div>
            <div className="flex items-center gap-0.5 border border-zinc-900 bg-zinc-950 px-2 py-1">
              <Star size={10} className="text-[#CCFF00] fill-[#CCFF00]" />
              <span className="text-[9px] font-black text-white ml-1">4.9 RATIO</span>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
