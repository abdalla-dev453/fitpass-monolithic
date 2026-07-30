import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "What happens to unused credits?",
    a: "Drop-In and Flex Pass credits stay active until your pass expires (30 or 90 days from purchase). Unused credits don't roll over into a new purchase, so pick the plan that matches how often you actually train.",
  },
  {
    q: "Can I cancel a class after booking?",
    a: "Yes. Cancel any time before the class starts and your credit is refunded automatically to your account — no front-desk call required.",
  },
  {
    q: "Does one pass really work at every studio?",
    a: "Every studio and class in the FitPass network accepts every plan. A single 10-Class Flex Pass can be spent across Zen Flow Loft, Iron Pulse Lab, or any future partner studio.",
  },
  {
    q: "Is Monthly Unlimited really unlimited?",
    a: "Yes, with a fair-use cap of one booking per class per day so spots stay available for everyone. Most members average 12–16 classes a month on this plan.",
  },
  {
    q: "How do I switch plans?",
    a: "Your current pass runs until its credits or expiry date are used up. Purchase a new plan whenever you like — the newest active pass with remaining credits is the one classes draw from first.",
  },
];

function FaqItem({ q, a, isOpen, onToggle }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-4 px-6 py-5 text-left"
        aria-expanded={isOpen}
      >
        <span className="font-display font-semibold text-white">{q}</span>
        <ChevronDown
          size={18}
          className={`shrink-0 text-emerald-400 transition-transform duration-300 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>
      <div
        className={`grid transition-all duration-300 ease-out-expo ${
          isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="overflow-hidden">
          <p className="px-6 pb-5 text-sm text-slate-400 leading-relaxed">{a}</p>
        </div>
      </div>
    </div>
  );
}

export default function Faq() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <div className="space-y-3">
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