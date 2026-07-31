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
    <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <SectionHeading
            eyebrow="Partner network"
            title="Studios you can walk into today."
            description="Every studio below accepts every FitPass plan — no extra sign-up, no separate membership."
          />

          <div className="relative w-full md:max-w-xs">
            <MapPin
              size={16}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Filter by neighborhood..."
              className="w-full rounded-full border border-white/10 bg-white/5 pl-11 pr-4 py-3 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-400/50 focus:border-emerald-400/50"
            />
          </div>
        </div>

        <div className="mt-12">
          {status === "loading" && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton h-52" />
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
                Make sure the Flask backend is running, then try again.
              </p>
              <button
                onClick={() => setRetryToken((t) => t + 1)}
                className="mt-6 btn-secondary !py-2.5"
              >
                <RefreshCw size={14} /> Retry
              </button>
            </div>
          )}

          {status === "ready" && studios.length === 0 && (
            <div className="glass rounded-2xl py-16 text-center px-6">
              <p className="text-white font-semibold">
                No studios match that search yet.
              </p>
              <p className="mt-1 text-sm text-slate-400">
                Try a different neighborhood or clear the filter.
              </p>
            </div>
          )}

          {status === "ready" && studios.length > 0 && (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {studios.map((studio) => (
                <StudioCard key={studio.id} studio={studio} />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}