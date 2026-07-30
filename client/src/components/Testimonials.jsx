import React from "react";
import { Star, Quote } from "lucide-react";
import SectionHeading from "./SectionHeading.jsx";

const TESTIMONIALS = [
  {
    name: "Ahmad Chen",
    role: "Booked 42 classes this year",
    quote:
      "I used to pay for three separate studio memberships and still skip half my sessions. FitPass credits roll over between Zen Flow and Iron Pulse, so I actually use what I pay for.",
    initials: "AC",
  },
  {
    name: "Collins Meyers",
    role: "10-Class Flex Pass member",
    quote:
      "Cancelled a Tuesday HIIT session twenty minutes before it started and got my credit back instantly. No front desk call, no awkward email — it just refunded on the spot.",
    initials: "CM",
  },
  {
    name: "Clyde Nair",
    role: "Monthly Unlimited member",
    quote:
      "The spots-remaining count is the feature I didn't know I needed. I stopped showing up to sold-out Sunrise Vinyasa classes because the app told me before I left my apartment.",
    initials: "CN",
  },
  {
    name: "Diego Abdalla",
    role: "Switched from a single-studio plan",
    quote:
      "My old gym had one HIIT coach and I got bored. Now I rotate between three trainers across the city on the same pass, and I'm making faster progress than I did in two years before.",
    initials: "DA",
  },
];

export default function Testimonials() {
  return (
    <section className="relative py-24 md:py-32 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Member stories"
          title="Real routines, real credits spent."
        />

        <div className="mt-16 grid sm:grid-cols-2 gap-5">
          {TESTIMONIALS.map((t) => (
            <div key={t.name} className="group glass glass-hover rounded-2xl p-8">
              <Quote size={22} className="text-emerald-400/50" />
              <p className="mt-4 text-slate-200 leading-relaxed">"{t.quote}"</p>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-indigo-400 flex items-center justify-center font-display font-bold text-slate-950 text-sm">
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white leading-none">
                      {t.name}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">{t.role}</p>
                  </div>
                </div>
                <div className="flex items-center gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={13} className="text-emerald-400 fill-emerald-400" />
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}