import React from "react";
import { Link } from "react-router-dom";
import { Compass, ArrowRight } from "lucide-react";

export default function NotFound() {
  return (
    <section className="relative min-h-[70vh] flex items-center justify-center pt-32 pb-24 px-6">
      <div className="text-center max-w-md">
        <div className="mx-auto h-16 w-16 rounded-2xl glass flex items-center justify-center">
          <Compass size={28} className="text-emerald-400" />
        </div>
        <h1 className="mt-8 font-display font-extrabold tracking-tight text-4xl text-white">
          404
        </h1>
        <p className="mt-3 text-slate-400 leading-relaxed">
          This page didn't make it onto the schedule. It may have moved, or
          the link might be off.
        </p>
        <Link to="/" className="mt-8 btn-primary group inline-flex">
          Back to FitPass
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
        </Link>
      </div>
    </section>
  );
}