import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Heart, Target, Users2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";

const TIMELINE = [
  {
    year: "2024",
    title: "The problem, in one spreadsheet",
    description:
      "Our founders pulled attendance data from six independent studios and found the same pattern everywhere: 30–40% of class capacity going empty on any given week, while members down the street were still paying for memberships they barely used.",
  },
  {
    year: "2025",
    title: "First ten studio partners",
    description:
      "FitPass launched with a simple credit system — one pass, spendable at any partner studio. Ten founding studios opened their empty slots to the network in the first quarter.",
  },
  {
    year: "2026",
    title: "A citywide network",
    description:
      "Today the network spans yoga lofts, HIIT boxes, and Pilates studios across the city, with real-time booking and instant credit refunds built directly into the platform.",
  },
];

const VALUES = [
  {
    icon: Target,
    title: "Fill the room, not the funnel",
    description:
      "We measure success by classes attended, not sign-ups collected. An empty spot helps no one — not the studio, not the member.",
  },
  {
    icon: Heart,
    title: "Respect the instructor's craft",
    description:
      "Every trainer on FitPass is verified and reviewed by real members after real classes. Reputation is earned session by session.",
  },
  {
    icon: Users2,
    title: "No lock-in, ever",
    description:
      "Credits, not contracts. If a plan stops making sense for how you train, you simply stop buying it — nothing to cancel, nothing to negotiate.",
  },
];

export default function About() {
  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <span className="eyebrow">Our story</span>
          <h1 className="mt-4 font-display font-extrabold tracking-tight text-4xl sm:text-5xl text-white text-balance">
            Built for the studios and the members{" "}
            <span className="text-gradient">both</span>.
          </h1>
          <p className="mt-6 text-lg text-slate-400 leading-relaxed max-w-2xl mx-auto">
            FitPass exists because studio capacity and member motivation
            rarely line up on the same schedule. We built a credit system
            flexible enough to close that gap, one booking at a time.
          </p>
        </div>
      </section>

      <section className="relative py-20 md:py-24 bg-slate-900/40">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <SectionHeading eyebrow="How we got here" title="From a spreadsheet to a network." />

          <div className="mt-14 space-y-10">
            {TIMELINE.map((item, i) => (
              <div key={item.year} className="flex gap-6">
                <div className="flex flex-col items-center">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full glass font-display font-bold text-emerald-300 text-sm">
                    {item.year}
                  </span>
                  {i < TIMELINE.length - 1 && (
                    <span className="mt-2 w-px flex-1 bg-white/10" />
                  )}
                </div>
                <div className="pb-2">
                  <h3 className="font-display font-semibold text-lg text-white">
                    {item.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-400 leading-relaxed max-w-xl">
                    {item.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="What we believe"
            title="Principles that shape every feature we ship."
          />

          <div className="mt-14 grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div key={title} className="glass glass-hover rounded-2xl p-7">
                <div className="h-11 w-11 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center">
                  <Icon size={20} className="text-indigo-300" />
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

          <div className="mt-16 text-center">
            <Link to="/pricing" className="btn-primary group">
              Join the network
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}