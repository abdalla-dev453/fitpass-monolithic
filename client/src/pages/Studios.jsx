import React, { useEffect, useState } from "react";
import { AlertCircle, RefreshCw, MapPin } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import StudioCard from "../components/StudioCard.jsx";
import api from "../lib/api.js";

export default function Studios() {
  const [studios, setStudios] = useState([]);
  const [status, setStatus] = useState("loading");
  const [location, setLocation] = useState("");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    api
      .getStudios({ location: location || undefined })
      .then((data) => {
        if (!cancelled) {
          setStudios(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [location, retryToken]);

  return (
    <div className="bg-[#0B0C10] text-white select-none min-h-screen">
      
      {/* PARTNER LISTING HEADER STAGE */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-28 border-b-2 border-zinc-900 bg-gym-grid">
        
        {/* Giant structural background accent typography */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-[12rem] font-black tracking-tighter text-zinc-900/10 pointer-events-none uppercase z-0">
          STUODIOS
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          
          {/* Upper Action Bar Layout */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between pb-8 border-b-4 border-zinc-800 gap-6">
            <SectionHeading
              eyebrow="PARTNER NETWORK GRID"
              title="STUODIO LOCATIONS ACTIVE TODAY."
              description="EVERY STATION LISTED BELOW ACCEPTS ALL FITPASS CREDIT PACK TIERS. ZERO INDEPENDENT ACCESS DEPOSITS CONTRACTS."
            />

            {/* Industrial Geometric Filter Input */}
            <div className="relative w-full md:max-w-xs border-2 border-zinc-800 bg-zinc-950 p-1.5 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.1)] focus-within:border-[#CCFF00] focus-within:shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] transition-all duration-150">
              <MapPin
                size={14}
                strokeWidth={2.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="FILTER BY NEIGHBORHOOD..."
                className="w-full bg-transparent pl-10 pr-4 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>
          </div>

          {/* DYNAMIC STATES PIPELINE AREA */}
          <div className="mt-12">
            
            {/* Loading Box Grid Matrix */}
            {status === "loading" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="skeleton-box h-60 bg-zinc-950" />
                ))}
              </div>
            )}

            {/* Hard Matte Panel Error Intervention Block */}
            {status === "error" && (
              <div className="border-2 border-zinc-800 bg-zinc-950 p-12 text-center max-w-xl mx-auto shadow-[6px_6px_0px_0px_rgba(255,30,39,0.15)] border-red-900/60">
                <div className="inline-flex items-center justify-center p-3.5 bg-red-950/50 text-red-500 mb-4 border border-red-900">
                  <AlertCircle size={24} strokeWidth={2.5} />
                </div>
                <p className="font-display font-black text-lg uppercase tracking-tight text-white">
                  BACKEND DISPATCH OFFLINE
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  UNABLE TO MAP THE FITPASS API CHANNELS. VERIFY FLASK LOG INSTANCES ARE RUNNING AND ACTIVE.
                </p>
                <button
                  onClick={() => setRetryToken((t) => t + 1)}
                  className="mt-6 inline-flex items-center justify-center gap-2 border-2 border-white bg-transparent px-6 py-2.5 font-display text-xs font-black uppercase text-white tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  <RefreshCw size={12} strokeWidth={3} className="animate-spin-slow" /> RE-INITIALIZE TRACK
                </button>
              </div>
            )}

            {/* Empty Response Warning Block */}
            {status === "ready" && studios.length === 0 && (
              <div className="border-2 border-zinc-800 bg-zinc-950 py-16 text-center max-w-md mx-auto">
                <p className="font-display font-black text-zinc-400 uppercase tracking-widest text-sm">
                  NO PARTNER STATIONS DETECTED.
                </p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                  TRY MODIFYING THE LOCATION SEARCH FILTER QUERIES OR RESET SEARCH CHANNELS.
                </p>
              </div>
            )}

            {/* Clean Result Presentation Layout Grid */}
            {status === "ready" && studios.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {studios.map((studio) => (
                  <div key={studio.id} className="transition-transform transform hover:-translate-y-1">
                    <StudioCard studio={studio} />
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </section>

    </div>
  );
}
