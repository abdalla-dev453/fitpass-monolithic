import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import HeroSection from "../components/HeroSection.jsx";
import Features from "../components/Features.jsx";
import Testimonials from "../components/Testimonials.jsx";
import CtaBanner from "../components/CtaBanner.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import ClassCard from "../components/ClassCard.jsx";
import PricingCard from "../components/PricingCard.jsx";
import api from "../lib/api.js";

const FALLBACK_PLANS = [
  {
    key: "10-pack",
    name: "10-Class Flex Pass",
    credits: 10,
    price: 180.0,
    description: "The best value for a consistent routine.",
    perks: ["10 class credits", "Valid 90 days", "Any partner studio", "Priority booking window"],
    popular: true,
  },
];

function ClassesPreview() {
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState("loading");

  useEffect(() => {
    api
      .getClasses()
      .then((data) => {
        setClasses(data.slice(0, 3));
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }, []);

  return (
    <section className="relative py-24 md:py-32 bg-slate-900/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            eyebrow="Live schedule"
            title="Find your next class."
            description="A snapshot of what's open right now across the network."
          />
          <Link
            to="/classes"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors group shrink-0"
          >
            View full schedule
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        <div className="mt-12">
          {status === "loading" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-64" />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="glass rounded-2xl py-14 text-center px-6">
              <p className="text-white font-semibold">
                Couldn't load today's schedule.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Make sure the FitPass API is running, then refresh.
              </p>
            </div>
          )}

          {status === "ready" && classes.length === 0 && (
            <div className="glass rounded-2xl py-14 text-center px-6">
              <p className="text-white font-semibold">
                No classes on the schedule yet.
              </p>
            </div>
          )}

          {status === "ready" && classes.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {classes.map((c) => (
                <ClassCard key={c.id} fitnessClass={c} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function PricingPreview() {
  const [plan, setPlan] = useState(FALLBACK_PLANS[0]);

  useEffect(() => {
    api
      .getPassPlans()
      .then((data) => {
        const popular = data.find((p) => p.key === "10-pack");
        if (popular) {
          setPlan({ ...FALLBACK_PLANS[0], ...popular });
        }
      })
      .catch(() => {});
  }, []);

  return (
    <section className="relative py-24 md:py-32">
      <div className="max-w-5xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Membership passes"
          title="One price. Every studio in the network."
          description="Buy credits once, spend them anywhere — no lock-in contracts, no per-studio memberships."
          align="center"
        />

        <div className="mt-14 max-w-sm mx-auto">
          <PricingCard plan={plan} />
        </div>

        <div className="mt-8 text-center">
          <Link
            to="/pricing"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors group"
          >
            Compare all plans
            <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  return (
    <>
      <HeroSection />
      <Features />
      <ClassesPreview />
      <PricingPreview />
      <Testimonials />
      <CtaBanner />
    </>
  );
}