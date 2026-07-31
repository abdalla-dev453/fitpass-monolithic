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
    }).toUpperCase(); // Forced structural uppercase string conversion standard
  } catch {
    return iso ? iso.toUpperCase() : iso;
  }
}

export default function ClassCard({ fitnessClass }) {
  const spots = fitnessClass.spots_remaining;
  const isFull = typeof spots === "number" && spots <= 0;

  return (
    <div className="border-2 border-zinc-800 bg-zinc-950 rounded-none overflow-hidden flex flex-col justify-between transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 hover:border-[#CCFF00]/50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)]">
      <div className="p-5 md:p-6 flex-1">
        
        {/* UPPER STATUS DISPATCH LAYER */}
        <div className="flex items-center justify-between gap-3 pb-4 border-b border-zinc-900">
          {fitnessClass.category_name ? (
            <span className="bg-[#CCFF00] text-black font-sans font-black tracking-widest text-[9px] uppercase px-2.5 py-1 border border-black">
              {fitnessClass.category_name}
            </span>
          ) : (
            <div />
          )}
          
          <span
            className={`inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest px-2.5 py-1 border ${
              isFull
                ? "bg-red-950/40 text-red-500 border-red-900/60 animate-pulse"
                : "bg-zinc-900 text-zinc-400 border-zinc-800"
            }`}
          >
            <Users size={11} strokeWidth={2.5} />
            {isFull ? "FULL CAPACITY" : `${spots ?? "—"} SPOTS REMAINING`}
          </span>
        </div>

        {/* CORE DETAILS TYPOGRAPHY ACCENT */}
        <h3 className="mt-4 font-display font-black text-xl text-white tracking-tight uppercase leading-none">
          {fitnessClass.title}
        </h3>
        
        {fitnessClass.description && (
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider text-zinc-500 leading-normal line-clamp-2 min-h-[30px]">
            {fitnessClass.description}
          </p>
        )}

        {/* RUNTIME PARAMS FOOTNOTE GRID */}
        <div className="mt-5 pt-4 border-t border-zinc-900 space-y-2.5 text-[11px] font-black tracking-widest text-zinc-300 uppercase">
          <div className="flex items-center gap-2">
            <Clock size={13} className="text-zinc-600 shrink-0" strokeWidth={2.5} />
            <span>{formatClassTime(fitnessClass.start_time)}</span>
          </div>
          <div className="flex items-center gap-2 truncate">
            <MapPin size={13} className="text-zinc-600 shrink-0" strokeWidth={2.5} />
            <span className="truncate">
              {fitnessClass.studio_name || "STATION TBD"}
              {fitnessClass.trainer_name && ` • COACH ${fitnessClass.trainer_name}`}
            </span>
          </div>
        </div>
      </div>

      {/* HEAVY INTENSITY FOOTER RESERVATION ACTION BUTTON */}
      <button
        disabled={isFull}
        className={`w-full py-3.5 font-display text-xs font-black uppercase tracking-widest transition-all duration-100 border-t-2 border-transparent ${
          isFull
            ? "bg-zinc-900 text-zinc-600 cursor-not-allowed border-zinc-900"
            : "bg-[#CCFF00] text-black border-[#CCFF00] hover:bg-white hover:text-black hover:border-white"
        }`}
      >
        {isFull ? "STATION CAPACITY FULL" : "RESERVE ACCOUNT SPOT"}
      </button>
    </div>
  );
}
