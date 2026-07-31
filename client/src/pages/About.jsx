import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Target, Users2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";

import aboutBanner from "../assets/hero_banner.jpeg";

const TIMELINE = [
  {
    year: "2024",
    title: "THE CAPACITY GAP ANALYSIS",
    description:
      "Our core operational unit analyzed tracking attendance across six independent fitness stations. The output was identical everywhere: 30–40% of class slot allocations went completely unspent weekly, while traditional members paid deposits for infrastructure they rarely activated.",
  },
  {
    year: "2025",
    title: "THE FOUNDING TEN PARTNERS",
    description:
      "FitPass launched a streamlined tactical credit deployment system — one integrated pass, unspent across any discipline box. Ten founding locations opened their vacant capacities directly to our network pipeline in Q1.",
  },
  {
    year: "2026",
    title: "CITYWIDE PIPELINE ENFORCEMENT",
    description:
      "Today, the comprehensive network spans elite yoga lofts, intensive HIIT boxes, and high-performance Pilates studios across the entire metropolitan sector. Real-time booking dispatches and instant credit token transfers are built into our foundation.",
  },
];

const VALUES = [
  {
    icon: Target,
    title: "MAXIMIZE ROOM CAPACITY",
    description:
      "We measure operational success by raw classes completed, not vanity sign-up metrics. An unspent slot helps no one — not the facility operator, and not the athlete.",
  },
  {
    icon: Heart,
    title: "RESPECT THE TRAINER'S CRAFT",
    description:
      "Every instructor across the network is vetted and subject to direct member tracking evaluations. Professional authority is earned session by session.",
  },
  {
    icon: Users2,
    title: "ZERO DEPOSIT LOCK-IN",
    description:
      "Raw credit units, not lock-in contracts. If a plan setup stops matching your training velocity, you simply halt procurement — nothing to negotiate, no fine print.",
  },
];

export default function About() {
  return (
    /* 
      LAYOUT UPDATE: 
      1. Added inline background styles to inject the 'aboutBanner' across the entire page layout.
      2. Combined the image with a heavy, central radial/linear gradient to mask bright image areas.
      3. Added 'bg-fixed bg-cover bg-center' to anchor the graphic cleanly as a parallax canvas backdrop.
    */
    <div 
      className="bg-[#0B0C10] text-white select-none min-h-screen bg-fixed bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `linear-gradient(to bottom, rgba(11, 12, 16, 0.96) 0%, rgba(11, 12, 16, 0.8) 50%, rgba(11, 12, 16, 0.98) 100%), url(${aboutBanner})`,
      }}
    >
      
      {/* HERO SECTION CONTAINER */}
      {/* Removed bg-gym-grid to let the image show cleanly behind the text */}
      <section className="relative pt-32 pb-20 md:pt-44 md:pb-24 border-b-2 border-zinc-900/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex mb-4">
            <span className="bg-[#CCFF00] text-black font-sans font-black tracking-widest text-[10px] uppercase px-3 py-1 border border-black">
              OUR MISSION MANIFESTO
            </span>
          </div>
          
          <h1 className="mt-4 font-display font-black tracking-tighter text-4xl sm:text-4xl text-white uppercase leading-[0.95]">
            BUILT FOR STUDIOS AND <br />
            ATHLETES <span className="text-[#CCFF00]">SIMULTANEOUSLY.</span>
          </h1>
          
          <p className="mt-6 text-sm font-medium uppercase tracking-wide text-zinc-300 max-w-2xl mx-auto leading-relaxed">
            FITPASS EXISTS BECAUSE FACILITY RUNTIME CAPACITY AND ATHLETE MOTIVATION RARELY INTERSECT ON THE SAME SCHEDULE STATIONS. WE DEPLOYED A STRUCTURAL CREDIT ALLOCATION FLEXIBLE ENOUGH TO OVERRIDE THAT GAP.
          </p>
        </div>
      </section>

      {/* TIMELINE HISTORICAL TRACK */}
      {/* Changed bg-[#0B0C10] to bg-transparent so the background image remains visible */}
      <section className="relative py-24 bg-transparent border-b-2 border-zinc-900/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <div className="border-b-4 border-zinc-800 pb-4">
            <SectionHeading eyebrow="HISTORICAL NETWORK RUNTIME" title="FROM AN ANALYSIS SPREADSHEET TO A FEDERATION NETWORK." />
          </div>

          <div className="mt-14 space-y-12">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6 group">
                <div className="flex flex-col items-center">
                  <span className="flex h-14 w-14 shrink-0 items-center justify-center bg-zinc-950 border-2 border-zinc-800 font-display font-black text-white text-md tracking-tight group-hover:bg-[#CCFF00] group-hover:text-black group-hover:border-[#CCFF00] transition-colors duration-150">
                    {item.year}
                  </span>
                  {i < TIMELINE.length - 1 && (
                    <span className="mt-2 w-0.5 flex-1 bg-zinc-800" />
                  )}
                </div>
                <div className="pb-6 border-b border-zinc-900/60 w-full">
                  <h3 className="font-display font-black text-xl text-white uppercase tracking-tight">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-400 leading-relaxed max-w-2xl">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FRAMEWORK PRINCIPLES */}
      {/* Changed bg-[#0B0C10] to bg-transparent so the background image remains visible */}
      <section className="relative py-24 bg-transparent bg-gym-grid">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="border-b-4 border-zinc-800 pb-4">
            <SectionHeading
              eyebrow="OPERATIONAL PARADIGMS"
              title="PRINCIPLES THAT SHAPE EVERY ACCELERATOR CORE FEATURE WE DISPATCH."
            />
          </div>

          {/* Hard Structural Component Cards */}
          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="border-2 border-zinc-800 bg-zinc-950/90 backdrop-blur-sm p-6 rounded-none transition-all duration-150 hover:-translate-x-1 hover:-translate-y-1 hover:border-[#CCFF00]/50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.05)] hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)]">
                <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 text-[#CCFF00] flex items-center justify-center">
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

          {/* High Impact Core Conversion Anchor */}
          <div className="mt-16 text-center">
            <Link to="/pricing" className="btn-primary group">
              ENGAGE THE NETWORK ACCESS PIPELINE
              <ArrowRight size={16} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
}
