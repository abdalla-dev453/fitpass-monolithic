import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudioCard({ studio }) {
  return (
    <div className="glass glass-hover rounded-2xl p-7 flex flex-col">
      <div className="h-11 w-11 rounded-xl bg-indigo-400/10 border border-indigo-400/20 flex items-center justify-center">
        <MapPin size={20} className="text-indigo-300" />
      </div>

      <h3 className="mt-5 font-display font-semibold text-lg text-white">
        {studio.name}
      </h3>
      <p className="mt-1 text-sm text-slate-500">{studio.location}</p>
      {studio.description && (
        <p className="mt-3 text-sm text-slate-400 leading-relaxed flex-1 line-clamp-3">
          {studio.description}
        </p>
      )}

      <Link
        to={`/classes?studio_id=${studio.id}`}
        className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-300 hover:text-emerald-200 transition-colors group"
      >
        View schedule
        <ArrowRight
          size={14}
          className="transition-transform group-hover:translate-x-1"
        />
      </Link>
    </div>
  );
}