import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, AlertTriangle } from "lucide-react";
import HeroSection from "../components/HeroSection.jsx";
import Features from "../components/Features.jsx";
import Testimonials from "../components/Testimonials.jsx";
import CtaBanner from "../components/CtaBanner.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import ClassCard from "../components/ClassCard.jsx";
import PricingCard from "../components/PricingCard.jsx";
import api from "../lib/api.js";

const FALLBACK_PLANS = [
  {
    key: "10-pack",
    name: "10-CLASS FLEX PASS",
    credits: 10,
    price: 180.0,
    description: "The premium value choice for raw athletic consistency.",
    perks: ["10 CLASS CREDITS", "VALID 90 DAYS", "ANY PARTNER STUDIO", "PRIORITY BOOKING CUT"],
    popular: true,
  },
];

function ClassesPreview() {
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .getClasses()
      .then((data) => {
        setClasses(data.slice(0, 3));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section className="relative py-24 bg-[#0B0C10] text-white select-none border-b-2 border-zinc-900 bg-gym-grid">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        
        {/* Upper Athletic Grid Bar Layout */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-8 border-b-4 border-zinc-800 gap-6">
          <SectionHeading
            eyebrow="LIVE INTENSITY SCHEDULE"
            title="FIND YOUR NEXT SESSION."
            description="REAL-TIME OPENINGS ACROSS THE METROPOLITAN ELITE NETWORK."
          />
          <Link
            to="/classes"
            className="inline-flex items-center gap-2 bg-[#CCFF00] px-6 py-3 font-display text-xs font-black uppercase text-black hover:bg-white border-2 border-[#CCFF00] transition-all duration-150 group shrink-0 tracking-widest"
          >
            VIEW FULL SCHEDULE
            <ArrowRight size={14} strokeWidth={3} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12">
          {status === "loading" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-box h-72 bg-zinc-900 border-2 border-zinc-800" />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="border-2 border-zinc-800 bg-[#0B0C10] p-12 text-center max-w-xl mx-auto shadow-[6px_6px_0px_0px_rgba(204,255,0,1)]">
              <div className="inline-flex items-center justify-center p-3 bg-red-950 text-red-500 mb-4 border border-red-900">
                <AlertTriangle size={24} strokeWidth={2.5} />
              </div>
              <p className="font-display font-black text-lg uppercase tracking-tight text-white">
                NETWORK SUBSYSTEM OFFLINE
              </p>
              <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
                VERIFY THE FITPASS API INSTANCE RUNTIME IS ACTIVE, THEN REFRESH.
              </p>
            </div>
          )}

          {status === "ready" && classes.length === 0 && (
            <div className="border-2 border-zinc-800 bg-zinc-950 py-16 text-center">
              <p className="font-display font-black text-zinc-600 uppercase tracking-widest text-sm">
                NO DISPATCHED CLASSES ACTIVE CURRENTLY.
              </p>
            </div>
          )}

          {status === "ready" && classes.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {classes.map((c) => (
                <div key={c.id} className="transition-transform transform hover:-translate-y-1">
                  <ClassCard fitnessClass={c} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  const [plan, setPlan] = useState(FALLBACK_PLANS[0]);

  useEffect(() => {
    api
      .getPassPlans()
      .then((data) => {
        const popular = data.find((p) => p.key === "10-pack");
        if (popular) {
          setPlan({ ...FALLBACK_PLANS[0], ...popular });
        }
      })
      .catch(() => {});
  }, []);

  return (
    /* GYM BACKGROUND PICTURE LAYER STRUCUTURE: Employs a fixed high-contrast athlete image texture overlay */
    <section 
      className="relative py-32 bg-cover bg-center bg-no-repeat bg-fixed select-none border-b-2 border-zinc-900"
      style={{ 
        backgroundImage: `linear-gradient(to bottom, rgba(11, 12, 16, 0.92), rgba(11, 12, 16, 0.85)), url('https://unsplash.com')` 
      }}
    >
      <div className="max-w-5xl mx-auto px-6 lg:px-8 relative z-10">
        
        <div className="text-center max-w-2xl mx-auto">
          <SectionHeading
            eyebrow="MEMBERSHIP CREDITS"
            title="ONE FLAT VALUE. TOTAL FREEDOM."
            description="BUY CREDITS ONCE. ACCESS ANY DISCIPLINE BOX IN THE CITY. ZERO PER-STUDIO DEPOSIT CONTRACTS."
            align="center"
          />
        </div>

        {/* Heavy Angular Pricing Card Display with explicit deep background insulation */}
        <div className="mt-14 max-w-sm mx-auto transform transition-transform duration-150 hover:-translate-x-1 hover:-translate-y-1 bg-black/80 backdrop-blur-sm border-2 border-zinc-800">
          <PricingCard plan={plan} />
        </div>

        <div className="mt-12 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 font-display text-sm font-black uppercase text-[#CCFF00] hover:text-white tracking-widest border-b-2 border-[#CCFF00] pb-0.5 hover:border-white transition-colors group"
          >
            COMPARE ALL TIERS & ACCESS OVERVIEWS
            <ArrowRight size={14} strokeWidth={3} className="ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <div className="bg-[#0B0C10] min-h-screen text-white">
      <HeroSection />
      <Features />
      <ClassesPreview />
      <PricingPreview />
      <Testimonials />
      <CtaBanner />
    </div>
  );
}
