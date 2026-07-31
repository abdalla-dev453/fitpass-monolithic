import React from "react";
import { Zap, CreditCard, ShieldCheck, Search, RefreshCw, Star } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

const FEATURES = [
  {
    icon: Zap,
    title: "INSTANT REAL-TIME DISPATCH",
    description:
      "LIVE SLOT CAPACITIES CAPTURED ON EVERY CLASS. RESTRUCTURING YOUR RESERVATION THE MOMENT YOU ENGAGE — NO WAITING LOOPS.",
  },
  {
    icon: CreditCard,
    title: "FLEXIBLE CREDIT PACK TIERS",
    description:
      "PROCURE CREDITS ONCE, ALLOCATE THEM ANYWHERE IN THE PIPELINE. DROP IN FOR ONE DRILL OR OVERRIDE WITH UNLIMITED MONTHLY TIERS.",
  },
  {
    icon: ShieldCheck,
    title: "VETTED STATIONS & COACHES",
    description:
      "EVERY SINGLE PARTNER OPERATION ON FITPASS IS RIGIDLY VERIFIED FOR ACCREDITATION AND ACCELERATED PERFORMANCE QUALITY STABILITY.",
  },
  {
    icon: Search,
    title: "CITYWIDE PIPELINE SEARCH",
    description:
      "FILTER TRACKS BY TIER CATEGORY, SPECIFIC DISCIPLINE BOX, OR TIMELINE COORDINATES TO LOCATE YOUR EXACT REQUIRED SESSION STATION.",
  },
  {
    icon: RefreshCw,
    title: "FAULT-FREE DISPATCH RESETS",
    description:
      "PLANS SHIFT. HALT DISPATCH TARGET VALUES BEFORE CLASSES COMMENCE AND RECLAIM CORE TOKEN REFUNDS AUTOMATICALLY.",
  },
  {
    icon: Star,
    title: "OPERATIONAL ACCOUNT RATINGS",
    description:
      "LOG REVIEWS DIRECTLY INTO THE DATABASE PROFILE AFTER SESSIONS SO THE NEXT ATHLETE CAN VERIFY DISPATCH ACCURACY.",
  },
];

export default function Features() {
  return (
    <section className="relative py-24 bg-[#0B0C10] text-white select-none border-b-2 border-zinc-900 bg-gym-grid">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Upper Split Border */}
        <div className="border-b-4 border-zinc-800 pb-4">
          <SectionHeading
            eyebrow="SYSTEM ENFORCEMENTS"
            title="EVERYTHING AN INTENSIVE MEMBERSHIP NETWORK SHOULD DEPLOY."
            description="NO FRONT-DESK WAITING LINES. NO EXPIRED ANALOG HARD CARDS. JUST ONE ELITE CONNECTIVE ARCHITECTURE."
          />
        </div>

        {/* Aggressive Grid Metrics Distribution */}
        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div 
              key={title} 
              className="group border-2 border-zinc-800 bg-zinc-950 p-6 rounded-none transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 hover:border-[#CCFF00]/50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)]"
            >
              {/* Boxed Hard High-Contrast Icon Frame */}
              <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 text-[#CCFF00] flex items-center justify-center transition-colors group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-[#CCFF00]">
                <Icon size={16} strokeWidth={2.5} />
              </div>
              
              <h3 className="mt-5 font-display font-black text-lg text-white uppercase tracking-tight">
                {title}
              </h3>
              
              <p className="mt-2 text-[11px] font-bold uppercase tracking-wider text-zinc-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
