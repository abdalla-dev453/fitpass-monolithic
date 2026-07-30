import React from "react";
import { Zap, CreditCard, ShieldCheck, Search, RefreshCw, Star } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

const FEATURES = [
  {
    icon: Zap,
    title: "Instant, real-time booking",
    description:
      "Live spot counts on every class. Reserve your mat or bench the moment you decide — no waitlists, no phone calls.",
  },
  {
    icon: CreditCard,
    title: "Flexible credit passes",
    description:
      "Buy credits once, spend them anywhere in the network. Drop in for one class or go unlimited for the month.",
  },
  {
    icon: ShieldCheck,
    title: "Verified studios & trainers",
    description:
      "Every partner studio and coach on FitPass is vetted for safety, certification, and consistent class quality.",
  },
  {
    icon: Search,
    title: "Search across the whole city",
    description:
      "Filter by category, studio, trainer, or time slot to find the exact session that fits your schedule.",
  },
  {
    icon: RefreshCw,
    title: "Cancel and rebook freely",
    description:
      "Plans change. Cancel before a class starts and your credit is refunded automatically — every time.",
  },
  {
    icon: Star,
    title: "Rate every session",
    description:
      "Leave a rating and review after class so the next member knows exactly what they're booking.",
  },
];

export default function Features() {
  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Why FitPass"
          title="Everything a modern membership should be."
          description="No front-desk lines, no paper waivers, no expired punch cards. Just a network of great studios, unlocked by one account."
        />

        <div className="mt-16 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div key={title} className="group glass glass-hover rounded-2xl p-7">
              <div className="h-11 w-11 rounded-xl bg-emerald-400/10 border border-emerald-400/20 flex items-center justify-center group-hover:bg-emerald-400/20 transition-colors">
                <Icon size={20} className="text-emerald-400" />
              </div>
              <h3 className="mt-5 font-display font-semibold text-lg text-white">
                {title}
              </h3>
              <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                {description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}