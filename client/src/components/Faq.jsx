import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

const FAQS = [
  {
    q: "WHAT HAPPENS TO UNUSED CREDIT ALLOCATIONS?",
    a: "DROP-IN AND FLEX PASS CREDITS REMAIN OPERATIONAL UNTIL YOUR CHANNELS EXPIRE (30 OR 90 DAYS POST-PROCUREMENT). UNUSED TIERS DO NOT ROLL OVER INTO SEPARATE DEPOSITS, SO ALLOCATE THE ENGINE CORRESPONDING DIRECTLY TO YOUR RUNTIME MATRIX.",
  },
  {
    q: "CAN I CANCEL A REQUISITE AFTER DISPATCH BOOKING?",
    a: "YES. HALT INTENSITY DISPATCH CODES ANY TIME BEFORE CLASSES COMMENCE AND RECLAIM CORE TOKEN REFUNDS AUTOMATICALLY VIA PIPELINE CONTEXTS — ZERO DESK INTERACTION REQUISITE.",
  },
  {
    q: "DOES ONE ACTIVE PASS MANIFEST FREEDOM ACROSS EVERY STATION?",
    a: "EVERY COMPREHENSIVE BOX AND CLASS ACROSS THE NETWORK SYSTEM ACCEPTS ALL DEPLOYMENT PLANS. A SINGLE FLEX PASS INTEGRATES UNINTERRUPTED TRAFFIC BETWEEN ZEN FLOW LOFT, IRON PULSE LAB, OR ANY DEPLOYED PARTNER HUB.",
  },
  {
    q: "IS THE UNLIMITED MONTHLY OVERRIDE ABSOLUTE CAPACITY?",
    a: "YES, RESTRICTED ONLY BY A SYSTEM BALANCE SAFEGUARD CAP OF ONE DISPATCH PER CLASS PER REQUISITE DAY. THIS SECURES PIPELINE CAPACITY DISPATCH STABILITY ACROSS THE MATRIX TRAFFIC WINDOWS.",
  },
  {
    q: "HOW DO I UPGRADE OR OVERRIDE CORE ACTIVE PLANS?",
    a: "YOUR CURRENT BALANCES ENFORCE RUNTIME TRACKS UNTIL CREDITS OR TIME TARGET VALUES EXPIRE. EXECUTE RAW PROCUREMENTS WHENEVER REQUISITE — NEW ACTIVE ASSETS AUTOMATICALLY COMMENCE DOMINANCE.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className={`rounded-none border-2 bg-zinc-950 transition-colors duration-100 ${
      isOpen ? "border-[#CCFF00]" : "border-zinc-900 hover:border-zinc-800"
    }`}>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left group"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <HelpCircle size={14} className={`shrink-0 ${isOpen ? "text-[#CCFF00]" : "text-zinc-600 group-hover:text-zinc-400"}`} strokeWidth={2.5} />
          <span className={`font-display font-black text-sm uppercase tracking-tight transition-colors ${isOpen ? "text-[#CCFF00]" : "text-white"}`}>
            {q}
          </span>
        </div>
        <ChevronDown
          size={16}
          strokeWidth={3}
          className={`shrink-0 text-zinc-500 transition-transform duration-150 ${
            isOpen ? "rotate-180 text-[#CCFF00]" : "group-hover:text-white"
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-150 ease-out ${
          isOpen ? "grid-rows-[1fr] opacity-100 border-t border-zinc-900" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-zinc-400 leading-relaxed bg-black/30">
            {a}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-4">
      {FAQS.map((item, i) => (
        <FaqItem
          key={item.q}
          q={item.q}
          a={item.a}
          isOpen={openIndex === i}
          onToggle={() => setOpenIndex(openIndex === i ? -1 : i)}
        />
      ))}
    </div>
  );
}
