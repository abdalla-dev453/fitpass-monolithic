import React from "react";
import { Activity } from "lucide-react";
import { useApp } from "../context/AppContext.jsx";

export default function Toast() {
  const { toast } = useApp();
  if (!toast) return null;

  return (
    <div className="fixed bottom-8 inset-x-0 z-[100] flex justify-center px-6 pointer-events-none select-none">
      {/* HARD GEOMETRIC NOTIFICATION PANEL */}
      <div className="pointer-events-auto flex items-center gap-3 bg-zinc-950 border-2 border-[#CCFF00] px-6 py-4 shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rounded-none max-w-md animate-pulse-fast">
        
        {/* FLASHING OPERATIONAL SIGNAL ICON */}
        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-[#CCFF00] text-black font-black">
          <Activity size={14} strokeWidth={3} />
        </span>

        {/* HIGH CONTRAST TRACK TEXT */}
        <p className="text-xs font-black uppercase tracking-widest text-white leading-normal">
          {toast}
        </p>
        
      </div>
    </div>
  );
}
