import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Activity } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="relative py-24 bg-[#0B0C10] text-white select-none border-b-2 border-zinc-900 bg-gym-grid">
      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        
        {/* HARD GEOMETRIC IMPACT ACCELERATOR CONTAINER */}
        <div className="relative overflow-hidden border-2 border-zinc-800 bg-zinc-950 px-8 py-16 md:px-16 md:py-20 text-center rounded-none shadow-[8px_8px_0px_0px_rgba(204,255,0,1)] transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:border-[#CCFF00]/50">
          
          {/* GIANT REAR BACKGROUND DESIGN TYPOGRAPHY LAYER */}
          <div className="absolute -top-6 -left-10 font-display text-[10rem] font-black tracking-tighter text-zinc-900/10 pointer-events-none select-none uppercase z-0">
            GO
          </div>

          <div className="relative z-10">
            <div className="inline-flex mb-4">
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-500 font-sans font-black tracking-widest text-[9px] uppercase px-3 py-1 flex items-center gap-1.5">
                <Activity size={12} className="text-[#CCFF00]" strokeWidth={2.5} /> INSTANT ACCESS GATEWAY
              </span>
            </div>

            {/* Aggressive Athletic Title Header */}
            <h2 className="font-display font-black tracking-tighter text-3xl sm:text-5xl text-white uppercase leading-[0.95]">
              YOUR FIRST DISPATCH IS <br />
              A SINGLE <span className="text-[#CCFF00]">TAP AWAY.</span>
            </h2>
            
            <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-400 max-w-lg mx-auto leading-relaxed">
              CHOOSE YOUR PASSPORT PACK, LOCK TARGET COORDINATES, AND ENGAGE. ZERO LOCK-IN PAPERS TO NEGOTIATE, NO DESK CHANNELS TO NOTIFY.
            </p>

            {/* Industrial Action Button Terminals */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="btn-primary group">
                GET YOUR PASS
                <ArrowRight
                  size={16}
                  strokeWidth={3}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link 
                to="/classes" 
                className="inline-flex items-center justify-center gap-2 border-2 border-white bg-transparent px-8 py-3.5 font-display text-sm font-black uppercase text-white tracking-widest hover:bg-white hover:text-black transition-colors"
              >
                SEE LIVE SCHEDULE
              </Link>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
