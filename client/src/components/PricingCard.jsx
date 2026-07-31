import React from "react";
import { Check } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function PricingCard({ plan }) {
  const { purchasePlan, myPass } = useApp();

  const isActivePass = myPass?.key === plan.key;

  return (
    <div
      className={`relative flex flex-col justify-between border-2 bg-zinc-950 p-6 md:p-8 rounded-none transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 ${
        plan.popular
          ? "shadow-[6px_6px_0px_0px_rgba(204,255,0,1)] border-[#CCFF00] md:-translate-y-2"
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
          <span className="font-display font-black text-4xl text-white">
            ${Number(plan.price).toFixed(0)}
          </span>
          <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
            / {plan.credits >= 99 ? "UNLIMITED" : `${plan.credits} CREDITS`}
          </span>
        </div>

        {/* Feature Lists */}
        <ul className="mt-6 space-y-3 flex-1">
          {plan.perks.map((perk) => (
            <li key={perk} className="flex items-center gap-2 text-xs font-bold text-zinc-300 uppercase tracking-wide">
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
            isActivePass
              ? "bg-zinc-900 text-[#CCFF00] border-[#CCFF00] hover:bg-white hover:text-black hover:border-white"
              : plan.popular
                ? "bg-[#CCFF00] text-black border-[#CCFF00] hover:bg-white hover:border-white"
                : "bg-transparent text-white border-white hover:bg-white hover:text-black"
          }`}
        >
          {isActivePass ? "ACTIVE — RENEW PASS" : "ACTIVATE ACCOUNT PASS"}
        </button>
      </div>
    </div>
  );
}
