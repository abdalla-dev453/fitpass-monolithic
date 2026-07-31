import React from "react";
import { Star, Quote } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

const TESTIMONIALS = [
  {
    name: "AHMAD CHEN",
    role: "COMPLETED 42 SESSIONS THIS PERIOD",
    quote:
      "I USED TO OUTLAY CASH FOR THREE SEPARATE TRACK SUBSCRIPTIONS AND SKIPPED CAPACITIES CONSTANTLY. FITPASS CREDITS SYNC DIRECTLY BETWEEN ZEN FLOW AND IRON PULSE, SO I ACTUALLY ACTIVATE UNUSED ALLOCATIONS.",
    initials: "AC",
  },
  {
    name: "COLLINS MEYERS",
    role: "10-CLASS FLEX ACCELERATOR MEMBER",
    quote:
      "CANCELLED A TUESDAY HIIT INTENSITY SLOT TWENTY MINUTES BEFORE DISPATCH AND COLLECTED CORE CREDITS BACK IMMEDIATELY. ZERO DESK COMM-LINKS REQUIRED — THE REFUND HIT INSTANTLY.",
    initials: "CM",
  },
  {
    name: "CLYDE NAIR",
    role: "MONTHLY UNLIMITED ALLOCATION MEMBER",
    quote:
      "THE LIVE CAPACITY COUNTER IS THE CRITICAL COMPONENT I REQUIRED. I HALTED DRIVING TO OVERBOOKED VINYASA STATIONS BECAUSE THE TERMINAL INTELLIGENCE REDIRECTED ME VIA PRE-FLIGHT VERIFICATIONS.",
    initials: "CN",
  },
  {
    name: "DIEGO ABDALLA",
    role: "CONVERTED FROM SINGLE-STATION LOCK-INS",
    quote:
      "MY LEGACY INFRASTRUCTURE HAD ONE COACH AND PROGRESS STAGNATED. NOW I ROTATE DRILLS ACROSS THREE METROPOLITAN REQUISITES ON THE SAME TIER PASS, DRIVING FASTER INTENSITY BREAKTHROUGHS.",
    initials: "DA",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 bg-[#0B0C10] text-white select-none border-b-2 border-zinc-900 bg-gym-grid">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Upper Grid Split Border */}
        <div className="border-b-4 border-zinc-800 pb-4">
          <SectionHeading
            eyebrow="ATHLETE REVIEWS"
            title="REAL ROUTINES. TARGET CREDITS ACTIVATED."
          />
        </div>

        {/* Aggressive Industrial Grid Matrices */}
        <div className="mt-16 grid sm:grid-cols-2 gap-8">
          {TESTIMONIALS.map((t) => (
            <div 
              key={t.name} 
              className="border-2 border-zinc-800 bg-zinc-950 p-8 rounded-none transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 hover:border-[#CCFF00]/50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] flex flex-col justify-between"
            >
              <div>
                <Quote size={20} className="text-[#CCFF00]" strokeWidth={3} />
                <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-300 leading-relaxed italic">
                  "{t.quote}"
                </p>
              </div>

              {/* Bottom Profile Data Cluster */}
              <div className="mt-8 pt-4 border-t border-zinc-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  {/* Hard Solid Square Graphic Node */}
                  <div className="h-10 w-10 shrink-0 bg-zinc-900 border border-zinc-800 flex items-center justify-center font-display font-black text-[#CCFF00] text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-display font-black text-white uppercase tracking-tight">
                      {t.name}
                    </p>
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-0.5">
                      {t.role}
                    </p>
                  </div>
                </div>
                
                {/* Clean Volt Ratio Rating Lines */}
                <div className="flex items-center gap-0.5 self-end sm:self-center">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={11} className="text-[#CCFF00] fill-[#CCFF00]" />
                  ))}
                </div>
              </div>

            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
