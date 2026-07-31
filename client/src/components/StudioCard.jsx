import React from "react";
import { MapPin, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function StudioCard({ studio }) {
  return (
    <div className="border-2 border-zinc-800 bg-zinc-950 p-6 md:p-7 rounded-none flex flex-col justify-between h-full transition-all duration-150 transform hover:-translate-x-1 hover:-translate-y-1 hover:border-[#CCFF00]/50 shadow-[4px_4px_0px_0px_rgba(255,255,255,0.02)] hover:shadow-[6px_6px_0px_0px_rgba(204,255,0,1)]">
      
      <div>
        {/* Boxed Hard High-Contrast Icon Frame */}
        <div className="h-10 w-10 bg-zinc-900 border border-zinc-800 text-[#CCFF00] flex items-center justify-center">
          <MapPin size={16} strokeWidth={2.5} />
        </div>

        {/* Studio Title Header */}
        <h3 className="mt-5 font-display font-black text-xl text-white tracking-tight uppercase leading-none">
          {studio.name}
        </h3>
        
        {/* Location Station Badge Line */}
        <p className="mt-2 text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">
          STATION: {studio.location}
        </p>
        
        {/* Industrial Description Paragraph Block */}
        {studio.description && (
          <p className="mt-4 text-xs font-bold uppercase tracking-wider text-zinc-500 leading-relaxed line-clamp-3">
            {studio.description}
          </p>
        )}
      </div>

      {/* Heavy High-Contrast Link Terminal Action */}
      <div className="mt-6 pt-4 border-t border-zinc-900/60">
        <Link
          to={`/classes?studio_id=${studio.id}`}
          className="inline-flex items-center gap-1.5 font-display text-xs font-black uppercase text-white hover:text-[#CCFF00] tracking-widest group"
        >
          ENGAGE SCHEDULE MATRIX
          <ArrowRight
            size={14}
            strokeWidth={3}
            className="ml-1 transition-transform group-hover:translate-x-1 text-[#CCFF00]"
          />
        </Link>
      </div>

    </div>
  );
}
