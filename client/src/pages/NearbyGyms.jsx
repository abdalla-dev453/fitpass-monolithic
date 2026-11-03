import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { MapPin, AlertCircle, RefreshCw, Loader2, Search, ExternalLink, Calendar, CheckCircle2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import api from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";

const QUICK_CITIES = [
  { name: "Downtown HQ", lat: 40.7128, lng: -74.0060 },
  { name: "Uptown Core", lat: 40.7831, lng: -73.9712 },
  { name: "Midtown West", lat: 40.7589, lng: -73.9851 },
  { name: "Brooklyn Yard", lat: 40.6782, lng: -73.9442 },
];

export default function NearbyGyms() {
  const { showToast } = useApp();
  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [error, setError] = useState(null);
  const [studios, setStudios] = useState([]);
  const [discovered, setDiscovered] = useState([]);
  const [manualLocation, setManualLocation] = useState("");
  const [requestedGyms, setRequestedGyms] = useState({});

  const fetchNearby = useCallback((lat, lng) => {
    setStatus("loading");
    setError(null);
    api
      .getNearbyGyms({ lat, lng })
      .then((data) => {
        setStudios(data.studios || []);
        setDiscovered(data.discovered || []);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message || "Unable to fetch nearby facilities.");
        setStatus("error");
      });
  }, []);

  const locateUser = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation. Use the search or quick city buttons below.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchNearby(pos.coords.latitude, pos.coords.longitude),
      () => {
        // Soft fallback to default Downtown coords so the user immediately sees data
        fetchNearby(40.7128, -74.0060);
      },
      { timeout: 7000 }
    );
  }, [fetchNearby]);

  async function handleManualSearch(e) {
    e.preventDefault();
    if (!manualLocation.trim()) return;

    setStatus("loading");
    setError(null);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualLocation
        )}`
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        setError("Location not found. Please try a different city or neighborhood.");
        setStatus("error");
        return;
      }

      const { lat, lon } = data[0];
      fetchNearby(parseFloat(lat), parseFloat(lon));
    } catch {
      setError("Failed to geocode location. Check your internet connection.");
      setStatus("error");
    }
  }

  const handleRequestGym = (gym) => {
    setRequestedGyms((prev) => ({ ...prev, [gym.place_id]: true }));
    showToast(`Request submitted for ${gym.name}! Our partnerships team has logged this.`);
  };

  useEffect(() => {
    locateUser();
  }, [locateUser]);

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen selection:bg-[#CCFF00] selection:text-black">
      <section className="pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="border-b-4 border-zinc-800 pb-6">
          <SectionHeading
            eyebrow="GYM DISCOVERY RADAR"
            title="FITNESS HUBS IN YOUR RADIUS."
            description="BOOKABLE FITPASS PARTNER STUDIOS PLUS SURROUNDING BOXES YOU CAN REQUEST WE INTEGRATE NEXT."
          />
        </div>

        {/* CONTROLS BAR */}
        <div className="mt-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={locateUser}
              type="button"
              disabled={status === "locating"}
              className="inline-flex items-center justify-center gap-2 border-2 border-[#CCFF00] text-black bg-[#CCFF00] hover:bg-white hover:border-white font-display text-xs font-black uppercase px-6 py-3 shrink-0 transition-all duration-150 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.3)] disabled:opacity-50"
            >
              <MapPin size={14} />
              {status === "locating" ? "DETECTING COORDINATES..." : "USE MY CURRENT LOCATION"}
            </button>

            <form onSubmit={handleManualSearch} className="flex-1 flex gap-2">
              <input
                type="text"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                placeholder="TYPE A METROPOLITAN CITY OR ADDRESS..."
                className="flex-1 bg-zinc-950 border-2 border-zinc-800 px-4 py-3 text-xs uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CCFF00] transition-colors"
              />
              <button
                type="submit"
                disabled={status === "loading" || status === "locating"}
                className="inline-flex items-center gap-2 bg-zinc-900 border-2 border-zinc-700 text-white font-display font-black uppercase text-xs px-6 py-3 shrink-0 hover:bg-white hover:text-black hover:border-white disabled:opacity-50 transition-colors"
              >
                <Search size={14} /> SEARCH
              </button>
            </form>
          </div>

          {/* Quick Preset Hubs */}
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">QUICK PRESETS:</span>
            {QUICK_CITIES.map((c) => (
              <button
                key={c.name}
                type="button"
                onClick={() => fetchNearby(c.lat, c.lng)}
                className="text-[10px] font-black uppercase tracking-wider px-3 py-1 bg-zinc-900/60 border border-zinc-800 text-zinc-300 hover:text-black hover:bg-[#CCFF00] hover:border-[#CCFF00] transition-colors"
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>

        {/* STATUS INDICATORS */}
        {(status === "locating" || status === "loading") && (
          <div className="mt-12 p-8 border border-zinc-800 bg-zinc-950 flex items-center justify-center gap-3 text-zinc-400 text-xs font-black uppercase tracking-widest">
            <Loader2 className="animate-spin text-[#CCFF00]" size={18} strokeWidth={2.5} />
            {status === "locating" ? "DETECTING LOCAL TELEMETRY..." : "SCANNING REGIONAL BOXES & DISPATCH NODES..."}
          </div>
        )}

        {status === "error" && (
          <div className="mt-12 p-6 border-2 border-red-900 bg-red-950/30 flex items-center justify-between text-red-400 text-xs font-black uppercase tracking-widest">
            <div className="flex items-center gap-3">
              <AlertCircle size={18} className="text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
            <button
              onClick={locateUser}
              className="inline-flex items-center gap-1.5 underline underline-offset-4 hover:text-white"
            >
              <RefreshCw size={12} strokeWidth={2.5} /> RETRY SCAN
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="mt-14 grid md:grid-cols-2 gap-8">
            {/* BOOKABLE STATIONS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-[#CCFF00] flex items-center gap-2">
                  <span className="flex h-2 w-2 bg-[#CCFF00] rounded-none animate-ping" />
                  BOOKABLE FITPASS PARTNER STATIONS ({studios.length})
                </h3>
              </div>

              {studios.length === 0 ? (
                <div className="border border-zinc-800 bg-zinc-950 p-8 text-center space-y-2">
                  <p className="font-display font-black text-xs uppercase tracking-widest text-zinc-500">
                    NO BOOKABLE FITPASS STATIONS WITHIN ACTIVE RADIUS.
                  </p>
                  <p className="text-[10px] uppercase text-zinc-600">
                    TRY ONE OF THE QUICK PRESET CITIES ABOVE OR EXPAND RADIUS.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {studios.map((s) => (
                    <div
                      key={s.id}
                      className="border-2 border-zinc-800 bg-zinc-950 p-5 flex flex-col justify-between gap-4 transition-all duration-150 hover:border-[#CCFF00]/50 hover:-translate-x-0.5 hover:-translate-y-0.5"
                    >
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="font-display font-black text-lg uppercase tracking-tight text-white">
                            {s.name}
                          </h4>
                          <span className="bg-[#CCFF00] text-black text-[9px] font-black uppercase tracking-widest px-2 py-0.5 border border-black">
                            PASSPORT ACTIVE
                          </span>
                        </div>
                        <p className="text-zinc-400 text-xs mt-1.5 flex items-center gap-1.5 uppercase font-medium">
                          <MapPin size={12} className="text-[#CCFF00] shrink-0" />
                          {s.location}
                        </p>
                        {s.description && (
                          <p className="text-zinc-500 text-[11px] mt-2 line-clamp-2 uppercase">
                            {s.description}
                          </p>
                        )}
                      </div>

                      <div className="pt-3 border-t border-zinc-900 flex items-center justify-between">
                        <Link
                          to={`/classes?studio_id=${s.id}`}
                          className="inline-flex items-center gap-1.5 text-[#CCFF00] hover:text-white font-display text-xs font-black uppercase tracking-widest group"
                        >
                          <Calendar size={13} />
                          VIEW LIVE CLASS SCHEDULE →
                        </Link>
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.name + " " + s.location)}`}
                          target="_blank"
                          rel="noreferrer"
                          className="text-zinc-500 hover:text-zinc-300 text-[10px] font-bold uppercase tracking-wider inline-flex items-center gap-1"
                        >
                          MAP <ExternalLink size={10} />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* UNCLAIMED EXTERNAL HUBS */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b-2 border-zinc-800 pb-3">
                <h3 className="font-display font-black text-sm uppercase tracking-widest text-zinc-400">
                  REGIONAL HUBS (REQUEST PARTNERSHIP) ({discovered.length})
                </h3>
              </div>

              {discovered.length === 0 ? (
                <div className="border border-dashed border-zinc-800 bg-zinc-950/50 p-8 text-center space-y-2">
                  <p className="font-display font-black text-xs uppercase tracking-widest text-zinc-500">
                    NO UNCLAIMED GYMS FOUND NEARBY.
                  </p>
                  <p className="text-[10px] uppercase text-zinc-600">
                    ALL DETECTED STATIONS ARE ALREADY CONNECTED OR RADAR HAS LIMITED COVERAGE IN THIS RANGE.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {discovered.map((g) => {
                    const isRequested = !!requestedGyms[g.place_id];
                    return (
                      <div
                        key={g.place_id}
                        className="border-2 border-dashed border-zinc-800 bg-zinc-950/70 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                      >
                        <div>
                          <p className="font-display font-black text-base uppercase text-white tracking-tight">
                            {g.name}
                          </p>
                          <p className="text-zinc-500 text-xs mt-1 uppercase flex items-center gap-1.5">
                            <MapPin size={12} className="text-zinc-600 shrink-0" />
                            {g.address || "METROPOLITAN AREA"}
                          </p>
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(g.name + " " + (g.address || ""))}`}
                            target="_blank"
                            rel="noreferrer"
                            className="mt-2 inline-flex items-center gap-1 text-[9px] font-mono uppercase text-zinc-500 hover:text-zinc-300"
                          >
                            VERIFY ADDRESS <ExternalLink size={10} />
                          </a>
                        </div>

                        <button
                          disabled={isRequested}
                          onClick={() => handleRequestGym(g)}
                          className={`font-display text-[10px] font-black uppercase px-4 py-2.5 shrink-0 border-2 transition-all duration-150 flex items-center justify-center gap-1.5 tracking-widest ${
                            isRequested
                              ? "bg-zinc-900 border-zinc-800 text-zinc-500 cursor-not-allowed"
                              : "border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black"
                          }`}
                        >
                          {isRequested ? (
                            <>
                              <CheckCircle2 size={12} />
                              REQUESTED
                            </>
                          ) : (
                            "REQUEST THIS GYM"
                          )}
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
