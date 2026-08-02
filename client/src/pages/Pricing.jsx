import React, { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { AlertCircle, HelpCircle, Check } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import Faq from "../components/Faq.jsx";
import api from "../lib/api.js";


const FALLBACK_PLANS = [
  {
    key: "drop-in",
    name: "SINGLE CLASS DROP-IN",
    credits: 1,
    price: 25.0,
    duration_days: 30,
    description: "ACTIVATE A SINGLE STATION WITH ZERO FIXED COMMITMENTS.",
    perks: ["1 CLASS CREDIT", "VALID 30 DAYS", "ANY PARTNER DISCIPLINE BOX"],
  },
  {
    key: "10-pack",
    name: "10-CLASS FLEX PASS",
    credits: 10,
    price: 180.0,
    duration_days: 90,
    description: "THE ULTIMATE ALLOCATOR TIERS FOR CONSISTENT WORKOUT ROUTINES.",
    perks: [
      "10 CLASS CREDITS",
      "VALID 90 DAYS",
      "ANY PARTNER DISCIPLINE BOX",
      "PRIORITY EXPEDITED BOOKING WINDOW",
    ],
    popular: true,
  },
  {
    key: "monthly",
    name: "MONTHLY UNLIMITED CREDITS",
    credits: 99,
    price: 150.0,
    duration_days: 30,
    description: "MAXIMUM VELOCITY OVERRIDE. TRAIN AS OFTEN AS REQUISITE.",
    perks: [
      "UNLIMITED CAPACITY ALLOCATIONS",
      "VALID 30 DAYS",
      "ANY PARTNER DISCIPLINE BOX",
      "IMMEDIATE FAULT-FREE CANCELLATIONS",
    ],
  },
];

export default function Pricing() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);
  const { purchasePlan } = useApp();

  useEffect(() => {
    api
      .getPassPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setPlans(
            data.map((p) => {
              const fallback = FALLBACK_PLANS.find((f) => f.key === p.key);
              return { ...fallback, ...p };
            })
          );
        }
      })
      .catch(() => {
        /* keep FALLBACK_PLANS — pricing stays visible even offline */
      });
  }, []);

  return (
    <div className="bg-[#0B0C10] text-white select-none min-h-screen">
      
      {/* TIERS SELECTION STAGE */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-28 border-b-2 border-zinc-900 bg-gym-grid">
        
        {/* Giant structural accent typography layer pinned in space */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-[12rem] font-black tracking-tighter text-zinc-900/10 pointer-events-none uppercase z-0">
          TIERS
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          <div className="border-b-4 border-zinc-800 pb-6 max-w-3xl mx-auto text-center">
            <div className="inline-flex mb-4">
              <span className="bg-[#CCFF00] text-black font-sans font-black tracking-widest text-[10px] uppercase px-3 py-1 border border-black">
                RESOURCE DEPLOYMENT MATRIX
              </span>
            </div>
            <SectionHeading
              eyebrow="CREDIT TIERS"
              title="ONE FLAT ALLOCATION. ANY SUB-BOX NETWORK."
              description="PROCURE CREDIT BALANCES ONCE, DEPLOY THEM ANYWHERE. NO PER-STUDIO PREMIUM LOCK-INS. ZERO FINE PRINT CONTRACTS."
              align="center"
              className="mx-auto"
            />
          </div>

          {/* Hard Geometric Card Layout Configurations (Bypassing external component conflicts) */}
          <div className="mt-16 grid md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div 
                key={plan.key} 
                className={`relative flex flex-col justify-between border-2 bg-zinc-950 p-6 md:p-8 rounded-none transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 ${
                  plan.popular 
                    ? "shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] border-[#CCFF00]" 
                    : "shadow-[6px_6px_0px_0px_rgba(255,255,255,0.05)] border-zinc-800 hover:shadow-[6px_6px_0px_0px_rgba(255,255,255,0.15)] hover:border-zinc-700"
                }`}
              >
                {/* Clean Absolute Badge Layer */}
                {plan.popular && (
                  <span className="absolute -top-3.5 right-6 bg-[#CCFF00] text-black text-[9px] font-black tracking-widest px-3 py-1 border border-black uppercase z-20">
                    MOST POPULAR DISPATCH
                  </span>
                )}

                <div>
                  {/* Card Title Details */}
                  <h3 className="font-display font-black text-xl text-white tracking-tight uppercase">
                    {plan.name}
                  </h3>
                  <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 leading-normal min-h-[32px]">
                    {plan.description}
                  </p>

                  {/* Price Tag Setup */}
                  <div className="mt-6 flex items-baseline gap-1.5 border-t border-b border-zinc-800 py-4">
                    <span className="font-display font-black text-4xl text-white">${plan.price}</span>
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                      / {plan.credits === 99 ? "UNLIMITED" : `${plan.credits} CREDITS`}
                    </span>
                  </div>

                  {/* Feature Lists */}
                  <ul className="mt-6 space-y-3">
                    {plan.perks.map((perk, idx) => (
                      <li key={idx} className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wide">
                        <Check size={13} className="text-[#CCFF00] shrink-0" strokeWidth={3} />
                        <span>{perk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Heavy High-Contrast Footer Call-To-Action Button */}
                <div className="mt-8 pt-4">
                  <button
                    onClick={() => purchasePlan(plan)}
                    className={`w-full py-3.5 font-display text-xs font-black uppercase tracking-widest border-2 transition-all duration-100 ${
                      plan.popular
                        ? "bg-[#CCFF00] text-black border-[#CCFF00] hover:bg-white hover:border-white"
                        : "bg-transparent text-white border-white hover:bg-white hover:text-black"
                    }`}
                  >
                    ACTIVATE ACCOUNT PASS
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Risk Mitigation Sub-Footer Bar */}
          <div className="mt-16 max-w-2xl mx-auto border border-zinc-800 bg-zinc-900/40 p-4 flex items-center gap-4">
            <AlertCircle size={18} className="text-[#CCFF00] shrink-0" strokeWidth={2.5} />
            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 leading-normal">
              ALL UNUSED CREDIT ALLOCATIONS ARE AUTOMATICALLY REDEPLOYED BACK TO OPERATIONAL BALANCE STORAGE CAPS UPON SUBROUTE EXPIRED TERM RESET STAGES.
            </p>
          </div>
        </div>
      </section>

      {/* CORE FAQ EXPEDITION GRID */}
      <section className="relative py-24 bg-[#0B0C10]">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          
          <div className="border-b-4 border-zinc-800 pb-4 text-center max-w-xl mx-auto">
            <div className="inline-flex mb-3">
              <span className="bg-zinc-900 border border-zinc-800 text-zinc-400 font-sans font-black tracking-widest text-[9px] uppercase px-3 py-1.5 flex items-center gap-1.5">
                <HelpCircle size={12} className="text-[#CCFF00]" strokeWidth={2.5} /> TERMINAL VERIFICATIONS
              </span>
            </div>
            <SectionHeading
              eyebrow="OPERATIONAL FAQS"
              title="FREQUENTLY EXAMINED OVERVIEWS"
              align="center"
              className="mx-auto"
            />
          </div>

          {/* Hard Matte Panel Inner Box Layout Injection */}
          <div className="mt-14 border-2 border-zinc-800 bg-zinc-950 p-6 sm:p-10 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
            <Faq />
          </div>
        </div>
      </section>

    </div>
  );
}
