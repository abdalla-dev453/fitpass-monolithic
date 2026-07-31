import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle, RefreshCw, X, Filter } from "lucide-react";
import ClassCard from "../components/ClassCard.jsx";
import SectionHeading from "../components/SectionHeading.jsx";
import { useApp } from "../context/AppContext.jsx";
import api from "../lib/api.js";

export default function Classes() {
  const { activeCategory, setActiveCategory, searchQuery, setSearchQuery } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const studioId = searchParams.get("studio_id") || undefined;

  const [studio, setStudio] = useState(null);
  const [categories, setCategories] = useState([]);
  const [classes, setClasses] = useState([]);
  const [status, setStatus] = useState("loading");
  const [retryToken, setRetryToken] = useState(0);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => setCategories([]));
  }, []);

  useEffect(() => {
    if (!studioId) {
      setStudio(null);
      return;
    }
    api.getStudio(studioId).then(setStudio).catch(() => setStudio(null));
  }, [studioId]);

  const categoryId = useMemo(() => {
    if (activeCategory === "All") return undefined;
    return categories.find((c) => c.name === activeCategory)?.id;
  }, [activeCategory, categories]);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");

    api
      .getClasses({ category_id: categoryId, studio_id: studioId, q: searchQuery || undefined })
      .then((data) => {
        if (!cancelled) {
          setClasses(data);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (!cancelled) setStatus("error");
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, studioId, searchQuery, retryToken]);

  const clearStudioFilter = () => {
    searchParams.delete("studio_id");
    setSearchParams(searchParams);
  };

  const pills = ["All", ...categories.map((c) => c.name)];

  return (
    <div className="bg-[#0B0C10] text-white select-none min-h-screen">
      
      {/* HEADER STAGE AND MATRIX FILTERS */}
      <section className="relative pt-32 pb-24 md:pt-44 md:pb-28 border-b-2 border-zinc-900 bg-gym-grid">
        
        {/* Giant structural background accent typography */}
        <div className="absolute top-12 left-1/2 -translate-x-1/2 font-display text-[12rem] font-black tracking-tighter text-zinc-900/10 pointer-events-none uppercase z-0">
          SCHEDULE
        </div>

        <div className="relative max-w-7xl mx-auto px-6 lg:px-8 z-10">
          
          <div className="border-b-4 border-zinc-800 pb-6">
            <SectionHeading
              eyebrow="LIVE DISPATCH TRACKER"
              title="EVERY WORKOUT SLT. EVERY BOX STATION. RIGHT NOW."
              description="FILTER BY INTENSITY CATEGORY, QUERIES BY DISCIPLINE NAME, OR ENFORCE REQUISITES BY TARGET PARTNER STATIONS."
            />

            {/* Active Studio Filter Isolated Tag */}
            {studio && (
              <div className="mt-4 inline-flex items-center gap-3 bg-zinc-950 border border-zinc-800 px-4 py-2 rounded-none">
                <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">ISOLATED TRACK:</span>
                <span className="text-xs font-black text-[#CCFF00] uppercase tracking-wide">{studio.name}</span>
                <button
                  onClick={clearStudioFilter}
                  className="h-5 w-5 bg-zinc-900 border border-zinc-800 hover:border-red-900 hover:text-red-500 flex items-center justify-center transition-colors"
                  aria-label="Clear studio filter"
                >
                  <X size={12} strokeWidth={3} />
                </button>
              </div>
            )}
          </div>

          {/* CONTROL RACK HUB */}
          <div className="mt-10 flex flex-col lg:flex-row lg:items-center gap-6 lg:justify-between pb-6 border-b border-zinc-900/60">
            
            {/* Boxed Kinetic Search Bar */}
            <div className="relative w-full lg:max-w-xs border-2 border-zinc-800 bg-zinc-950 p-1.5 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.05)] focus-within:border-[#CCFF00] focus-within:shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] transition-all duration-150">
              <Search
                size={14}
                strokeWidth={2.5}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600"
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="SEARCH INTENSITY CLASSES..."
                className="w-full bg-transparent pl-10 pr-4 py-2 text-xs font-black uppercase tracking-widest text-white placeholder:text-zinc-700 focus:outline-none"
              />
            </div>

            {/* Sharp Geometric Filter Grid Blocks */}
            <div className="flex flex-wrap gap-2 items-center">
              <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mr-2 hidden sm:inline-flex items-center gap-1.5">
                <Filter size={12} strokeWidth={2.5} /> CATEGORIES:
              </span>
              {pills.map((name) => (
                <button
                  key={name}
                  onClick={() => setActiveCategory(name)}
                  className={`rounded-none px-5 py-2.5 text-xs font-black uppercase tracking-widest border transition-all duration-100 ${
                    activeCategory === name
                      ? "bg-[#CCFF00] text-black border-[#CCFF00] shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]"
                      : "bg-zinc-950 text-zinc-400 border-zinc-800 hover:border-zinc-500 hover:text-white"
                  }`}
                >
                  {name}
                </button>
              ))}
            </div>
          </div>

          {/* DYNAMIC PIPELINE INJECTIONS */}
          <div className="mt-12">
            
            {/* Loading Box Matrix */}
            {status === "loading" && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="skeleton-box h-72 bg-zinc-950" />
                ))}
              </div>
            )}

            {/* Hard Panel Error Intervention */}
            {status === "error" && (
              <div className="border-2 border-zinc-800 bg-zinc-950 p-12 text-center max-w-xl mx-auto shadow-[6px_6px_0px_0px_rgba(255,30,39,0.15)] border-red-900/60">
                <div className="inline-flex items-center justify-center p-3.5 bg-red-950/50 text-red-500 mb-4 border border-red-900">
                  <AlertCircle size={24} strokeWidth={2.5} />
                </div>
                <p className="font-display font-black text-lg uppercase tracking-tight text-white">
                  DISPATCH INTERACTION ERROR
                </p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-zinc-500 leading-relaxed max-w-sm mx-auto">
                  UNABLE TO READ LIVE DATA NODES FROM THE FITPASS NETWORK. ENFORCE CONSTANTS ON THE BACKEND RUNTIME PIPELINE.
                </p>
                <button
                  onClick={() => setRetryToken((t) => t + 1)}
                  className="mt-6 inline-flex items-center justify-center gap-2 border-2 border-white bg-transparent px-6 py-2.5 font-display text-xs font-black uppercase text-white tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  <RefreshCw size={12} strokeWidth={3} /> RE-ENGAGE CORE SYSTEM
                </button>
              </div>
            )}

            {/* Empty Result Notification */}
            {status === "ready" && classes.length === 0 && (
              <div className="border-2 border-zinc-800 bg-zinc-950 py-16 text-center max-w-md mx-auto">
                <p className="font-display font-black text-zinc-400 uppercase tracking-widest text-sm">
                  ZERO SLOTS MATCH FILTERS.
                </p>
                <p className="mt-2 text-[10px] font-black uppercase tracking-wider text-zinc-600">
                  CLEAR SYSTEM QUERIES OR CHOOSE A DIFFERENT ATHLETIC DISCIPLINE TIER.
                </p>
              </div>
            )}

            {/* Clean Result Presentation Layout Grid */}
            {status === "ready" && classes.length > 0 && (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {classes.map((c) => (
                  <div key={c.id} className="transition-transform transform hover:-translate-y-1">
                    <ClassCard fitnessClass={c} />
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
