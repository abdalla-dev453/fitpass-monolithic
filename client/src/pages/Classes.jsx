import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Search, AlertCircle, RefreshCw, X } from "lucide-react";
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
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <SectionHeading
          eyebrow="Live schedule"
          title="Every class, every studio, right now."
          description="Search by name, filter by discipline, or jump in from a specific studio."
        />

        {studio && (
          <div className="mt-6 inline-flex items-center gap-2 rounded-full glass pl-4 pr-2 py-1.5 text-sm text-slate-200">
            Showing <span className="font-semibold text-white">{studio.name}</span>
            <button
              onClick={clearStudioFilter}
              className="h-6 w-6 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
              aria-label="Clear studio filter"
            >
              <X size={13} />
            </button>
          </div>
        )}

        <div className="mt-10 flex flex-col lg:flex-row lg:items-center gap-4 lg:justify-between">
          <div className="relative w-full lg:max-w-xs">
            <Search
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search classes..."
              className="w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {pills.map((name) => (
              <button
                key={name}
                onClick={() => setActiveCategory(name)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  activeCategory === name
                    ? "bg-emerald-400 text-slate-950"
                    : "bg-white/5 text-slate-300 border border-white/10 hover:border-white/25 hover:text-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10">
          {status === "loading" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton h-64" />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="glass rounded-2xl py-16 flex flex-col items-center text-center px-6">
              <AlertCircle size={28} className="text-amber-400" />
              <p className="mt-4 text-white font-semibold">
                Couldn't reach the FitPass API.
              </p>
              <p className="mt-1 text-sm text-slate-400 max-w-sm">
                Make sure the Flask backend is running at the URL set in{" "}
                <code className="text-emerald-300">VITE_API_URL</code>, then
                try again.
              </p>
              <button
                onClick={() => setRetryToken((t) => t + 1)}
                className="mt-6 btn-secondary !py-2.5"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {status === "ready" && classes.length === 0 && (
            <div className="glass rounded-2xl py-16 text-center px-6">
              <p className="text-white font-semibold">
                No classes match those filters yet.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try a different category or clear your search.
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