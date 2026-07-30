import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, PlayCircle, MapPin, Users, Star } from "lucide-react";

const STATS = [
  { label: "Partner studios", value: "50+" },
  { label: "Classes booked weekly", value: "1,200+" },
  { label: "Average rating", value: "4.9/5" },
];

export default function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-24 md:pt-44 md:pb-32 bg-mesh-gradient bg-grain">
      {/* Ambient grid texture */}
      <div
        className="absolute inset-0 opacity-[0.07] pointer-events-none"
        style={{
          backgroundImage:
            "linear-gradient(to right, white 1px, transparent 1px), linear-gradient(to bottom, white 1px, transparent 1px)",
          backgroundSize: "56px 56px",
        }}
      />

      <div className="relative max-w-7xl mx-auto px-6 lg:px-8 grid lg:grid-cols-2 gap-16 items-center">
        {/* Copy column */}
        <div>
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-semibold text-emerald-300 tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
            ONE PASS. EVERY STUDIO.
          </div>

          <h1 className="mt-6 font-display font-extrabold tracking-tight text-balance text-5xl sm:text-6xl lg:text-[3.75rem] leading-[1.05] text-white">
            Your body is capable of{" "}
            <span className="text-gradient">amazing things.</span>
          </h1>

          <p className="mt-6 text-lg text-slate-400 max-w-xl leading-relaxed">
            FitPass unlocks every yoga studio, HIIT box, and Pilates loft
            across the city — one membership, zero contracts. Find a class,
            check real-time spots, and book in under ten seconds.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/pricing" className="btn-primary group">
              Get Your Pass
              <ArrowRight
                size={16}
                className="transition-transform group-hover:translate-x-1"
              />
            </Link>
            <Link to="/classes" className="btn-secondary">
              <PlayCircle size={16} className="text-emerald-400" />
              Browse Classes
            </Link>
          </div>

          <div className="mt-14 grid grid-cols-3 gap-6 max-w-md">
            {STATS.map((stat) => (
              <div key={stat.label}>
                <div className="font-display font-bold text-2xl sm:text-3xl text-white tracking-tight">
                  {stat.value}
                </div>
                <div className="mt-1 text-xs text-slate-500 leading-tight">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Signature visual: a floating "live booking" glass card cluster */}
        <div className="relative h-[420px] sm:h-[480px] hidden lg:block">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
          </div>

          <div className="absolute top-6 right-4 w-72 rounded-2xl glass p-5 shadow-2xl animate-float">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-300">
                Next class
              </span>
              <span className="flex items-center gap-1 text-[11px] font-medium text-slate-400">
                <MapPin size={12} /> Downtown
              </span>
            </div>
            <h3 className="mt-3 font-display font-semibold text-lg text-white">
              Sunrise Vinyasa
            </h3>
            <p className="text-sm text-slate-400 mt-1">
              Zen Flow Loft · 7:00 AM
            </p>
            <div className="mt-4 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-300">
                <Users size={13} className="text-emerald-400" />4 spots left
              </span>
              <button className="text-xs font-semibold px-3.5 py-1.5 rounded-full bg-emerald-400 text-slate-950">
                Book
              </button>
            </div>
          </div>

          <div className="absolute bottom-10 left-0 w-64 rounded-2xl glass p-5 shadow-2xl animate-float-slow">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-emerald-400 flex items-center justify-center font-display font-bold text-slate-950 text-sm">
                MR
              </div>
              <div>
                <p className="text-sm font-semibold text-white leading-none">
                  Maya Rivera
                </p>
                <p className="text-xs text-slate-500 mt-1">HIIT Coach</p>
              </div>
            </div>
            <div className="mt-3 flex items-center gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star key={i} size={13} className="text-emerald-400 fill-emerald-400" />
              ))}
              <span className="text-xs text-slate-400 ml-1">4.9</span>
            </div>
          </div>

          <div className="absolute top-1/2 left-6 -translate-y-1/2 rounded-2xl glass px-5 py-4 shadow-2xl">
            <p className="text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
              Your credits
            </p>
            <p className="mt-1 font-display font-bold text-2xl text-white">
              8 <span className="text-sm font-medium text-slate-500">left</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}