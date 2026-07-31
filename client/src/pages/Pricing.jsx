import React, { useEffect, useState } from "react";
import SectionHeading from "../components/SectionHeading.jsx";
import PricingCard from "../components/PricingCard.jsx";
import Faq from "../components/Faq.jsx";
import api from "../lib/api.js";

// Mirrors PassController.PASS_PLANS on the backend — used as the initial
// render so pricing never flashes empty, then reconciled with live data.
const FALLBACK_PLANS = [
  {
    key: "drop-in",
    name: "Single Class Drop-In",
    credits: 1,
    price: 25.0,
    duration_days: 30,
    description: "Try a studio with zero commitment.",
    perks: ["1 class credit", "Valid 30 days", "Any partner studio"],
  },
  {
    key: "10-pack",
    name: "10-Class Flex Pass",
    credits: 10,
    price: 180.0,
    duration_days: 90,
    description: "The best value for a consistent routine.",
    perks: [
      "10 class credits",
      "Valid 90 days",
      "Any partner studio",
      "Priority booking window",
    ],
    popular: true,
  },
  {
    key: "monthly",
    name: "Monthly Unlimited",
    credits: 99,
    price: 150.0,
    duration_days: 30,
    description: "Train as often as you want, every month.",
    perks: [
      "Unlimited classes",
      "Valid 30 days",
      "Any partner studio",
      "Free cancellations",
    ],
  },
];

export default function Pricing() {
  const [plans, setPlans] = useState(FALLBACK_PLANS);

  useEffect(() => {
    api
      .getPassPlans()
      .then((data) => {
        if (Array.isArray(data) && data.length) {
          setPlans(
            data.map((p) => {
              const fallback = FALLBACK_PLANS.find((f) => f.key === p.key);
              return { ...fallback, ...p };
            })
          );
        }
      })
      .catch(() => {
        /* keep FALLBACK_PLANS — pricing stays visible even offline */
      });
  }, []);

  return (
    <>
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-28">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Membership passes"
            title="One price. Every studio in the network."
            description="Buy credits once, spend them anywhere. No lock-in contracts, no per-studio memberships."
            align="center"
            className="mx-auto"
          />

          <div className="mt-16 grid md:grid-cols-3 gap-6 items-stretch">
            {plans.map((plan) => (
              <PricingCard key={plan.key} plan={plan} />
            ))}
          </div>
        </div>
      </section>

      <section className="relative py-24 md:py-28 bg-slate-900/40">
        <div className="max-w-3xl mx-auto px-6 lg:px-8">
          <SectionHeading
            eyebrow="Questions"
            title="Frequently asked questions"
            align="center"
            className="mx-auto"
          />
          <div className="mt-12">
            <Faq />
          </div>
        </div>
      </section>
    </>
  );
}