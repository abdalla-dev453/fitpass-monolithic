import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function CtaBanner() {
  return (
    <section className="relative py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-400/10 via-white/5 to-indigo-400/10 px-8 py-16 md:px-16 md:py-20 text-center">
          <div className="absolute -top-24 -right-24 h-64 w-64 rounded-full bg-emerald-400/10 blur-3xl" />
          <div className="absolute -bottom-24 -left-24 h-64 w-64 rounded-full bg-indigo-400/10 blur-3xl" />

          <div className="relative">
            <h2 className="font-display font-extrabold tracking-tight text-3xl sm:text-4xl text-white text-balance">
              Your first class is a tap away.
            </h2>
            <p className="mt-4 text-slate-400 text-lg max-w-xl mx-auto leading-relaxed">
              Pick a pass, find a studio, and show up. No contracts to sign,
              no front desk to call.
            </p>
            <div className="mt-9 flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/pricing" className="btn-primary group">
                Get Your Pass
                <ArrowRight
                  size={16}
                  className="transition-transform group-hover:translate-x-1"
                />
              </Link>
              <Link to="/classes" className="btn-secondary">
                See what's on today
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}