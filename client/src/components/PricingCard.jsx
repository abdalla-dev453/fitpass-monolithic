import React from "react";
import { Check, Sparkles } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function PricingCard({ plan }) {
  const { purchasePlan, myPass } = useApp();

  return (
    <div
      className={`relative rounded-2xl p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
        plan.popular
          ? "border-2 border-emerald-400/60 bg-emerald-400/[0.06] shadow-2xl shadow-emerald-400/10 md:-translate-y-3"
          : "glass"
      }`}
    >
      {plan.popular && (
        <span className="absolute -top-3.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1 rounded-full bg-emerald-400 text-slate-950 text-xs font-bold px-3.5 py-1.5">
          <Sparkles size={12} /> Most Popular
        </span>
      )}

      <h3 className="font-display font-semibold text-xl text-white">
        {plan.name}
      </h3>
      <p className="mt-1.5 text-sm text-slate-400">{plan.description}</p>

      <div className="mt-6 flex items-baseline gap-1">
        <span className="font-display font-extrabold text-4xl text-white tracking-tight">
          ${Number(plan.price).toFixed(0)}
        </span>
        <span className="text-sm text-slate-500">
          / {plan.credits >= 99 ? "month" : `${plan.credits} credits`}
        </span>
      </div>

      <ul className="mt-7 space-y-3 flex-1">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm text-slate-300">
            <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
            {perk}
          </li>
        ))}
      </ul>

      <button
        onClick={() => purchasePlan(plan)}
        className={`mt-8 w-full rounded-full py-3 text-sm font-semibold transition-all duration-300 ${
          plan.popular
            ? "bg-emerald-400 text-slate-950 hover:bg-emerald-300 hover:shadow-lg hover:shadow-emerald-400/25"
            : "bg-white/10 text-white hover:bg-white/15 border border-white/10"
        }`}
      >
        {myPass?.key === plan.key ? "Active — Renew" : "Get this pass"}
      </button>
    </div>
  );
}