import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Activity, Instagram, Twitter, Facebook, Youtube, ArrowRight, Check } from "lucide-react";

const COLUMNS = [
  {
    title: "Platform",
    links: [
      { label: "Browse classes", to: "/classes" },
      { label: "Studio partners", to: "/studios" },
      { label: "Pricing", to: "/pricing" },
      { label: "About FitPass", to: "/about" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Our story", to: "/about" },
      { label: "Careers", to: "#" },
      { label: "Press", to: "#" },
      { label: "Contact", to: "#" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help center", to: "#" },
      { label: "Cancellation policy", to: "/pricing" },
      { label: "Safety standards", to: "/about" },
      { label: "Studio sign-up", to: "#" },
    ],
  },
];

export default function Footer() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
    setEmail("");
    window.setTimeout(() => setSubmitted(false), 3200);
  };

  return (
    <footer className="relative border-t border-white/10 bg-slate-950">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16 md:py-20">
        <div className="grid lg:grid-cols-[1.4fr,1fr,1fr,1fr] gap-12">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-400/10 border border-emerald-400/30">
                <Activity size={18} className="text-emerald-400" />
              </span>
              <span className="font-display font-bold text-lg tracking-tight text-white">
                Fit<span className="text-emerald-400">Pass</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-slate-400 leading-relaxed max-w-xs">
              One membership for every yoga studio, HIIT box, and Pilates
              loft in the city. Book instantly, train anywhere.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[Instagram, Twitter, Facebook, Youtube].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="h-9 w-9 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-slate-400 hover:text-emerald-400 hover:border-emerald-400/30 transition-colors"
                  aria-label="Social link"
                >
                  <Icon size={15} />
                </a>
              ))}
            </div>
          </div>

          {COLUMNS.map((col) => (
            <div key={col.title}>
              <h4 className="font-display font-semibold text-sm text-white tracking-wide">
                {col.title}
              </h4>
              <ul className="mt-4 space-y-3">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.to}
                      className="text-sm text-slate-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 pt-10 border-t border-white/10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <h4 className="font-display font-semibold text-white">
              Get the weekly class drop
            </h4>
            <p className="mt-1 text-sm text-slate-400">
              New studio partners and schedule updates, once a week.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex w-full max-w-sm gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="flex-1 rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
            />
            <button
              type="submit"
              className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-emerald-400 px-4 py-2.5 text-sm font-semibold text-slate-950 hover:bg-emerald-300 transition-colors"
            >
              {submitted ? <Check size={15} /> : <ArrowRight size={15} />}
            </button>
          </form>
        </div>

        <div className="mt-10 flex flex-col-reverse sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <p>© {new Date().getFullYear()} FitPass. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="hover:text-slate-300 transition-colors">
              Privacy
            </a>
            <a href="#" className="hover:text-slate-300 transition-colors">
              Terms
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}