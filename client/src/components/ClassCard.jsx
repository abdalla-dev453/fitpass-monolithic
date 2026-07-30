import React from "react";
import { Clock, MapPin, Users } from "lucide-react";

export function formatClassTime(iso) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export default function ClassCard({ fitnessClass }) {
  const spots = fitnessClass.spots_remaining;
  const isFull = typeof spots === "number" && spots <= 0;

  return (
    <div className="glass glass-hover rounded-2xl overflow-hidden flex flex-col">
      <div className="p-6 flex-1">
        <div className="flex items-start justify-between gap-3">
          {fitnessClass.category_name && (
            <span className="inline-flex text-[11px] font-semibold uppercase tracking-wider text-emerald-300 bg-emerald-400/10 border border-emerald-400/20 rounded-full px-2.5 py-1">
              {fitnessClass.category_name}
            </span>
          )}
          <span
            className={`inline-flex items-center gap-1 text-xs font-medium rounded-full px-2.5 py-1 ${
              isFull
                ? "bg-red-400/10 text-red-300 border border-red-400/20"
                : "bg-white/5 text-slate-300 border border-white/10"
            }`}
          >
            <Users size={12} />
            {isFull ? "Full" : `${spots ?? "—"} spots left`}
          </span>
        </div>

        <h3 className="mt-4 font-display font-semibold text-lg text-white">
          {fitnessClass.title}
        </h3>
        {fitnessClass.description && (
          <p className="mt-1.5 text-sm text-slate-400 leading-relaxed line-clamp-2">
            {fitnessClass.description}
          </p>
        )}

        <div className="mt-5 space-y-2 text-sm text-slate-300">
          <div className="flex items-center gap-2">
            <Clock size={14} className="text-slate-500 shrink-0" />
            {formatClassTime(fitnessClass.start_time)}
          </div>
          <div className="flex items-center gap-2">
            <MapPin size={14} className="text-slate-500 shrink-0" />
            {fitnessClass.studio_name || "Studio TBD"}
            {fitnessClass.trainer_name && ` · ${fitnessClass.trainer_name}`}
          </div>
        </div>
      </div>

      <button
        disabled={isFull}
        className="w-full py-3 text-sm font-semibold border-t border-white/10 text-slate-950 bg-emerald-400 transition-colors hover:bg-emerald-300 disabled:bg-white/5 disabled:text-slate-500 disabled:cursor-not-allowed disabled:hover:bg-white/5"
      >
        {isFull ? "Class full" : "Reserve your spot"}
      </button>
    </div>
  );
}