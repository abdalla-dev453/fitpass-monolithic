import React, { useEffect, useState } from "react";
import { MapPin, AlertCircle, RefreshCw, Loader2, Search } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import api from "../lib/api.js";

export default function NearbyGyms() {
  const [status, setStatus] = useState("idle"); // idle | locating | loading | ready | error
  const [error, setError] = useState(null);
  const [studios, setStudios] = useState([]);
  const [discovered, setDiscovered] = useState([]);
  const [manualLocation, setManualLocation] = useState("");

  function fetchNearby(lat, lng) {
    setStatus("loading");
    api
      .getNearbyGyms({ lat, lng })
      .then((data) => {
        setStudios(data.studios || []);
        setDiscovered(data.discovered || []);
        setStatus("ready");
      })
      .catch((err) => {
        setError(err.message);
        setStatus("error");
      });
  }

  function useMyLocation() {
    if (!navigator.geolocation) {
      setError("Your browser doesn't support geolocation. Try the manual search below.");
      setStatus("error");
      return;
    }
    setStatus("locating");
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchNearby(pos.coords.latitude, pos.coords.longitude),
      () => {
        setError("Location access denied. Try the manual search below.");
        setStatus("error");
      },
      { timeout: 8000 }
    );
  }

  // Geocode manual text address to lat/lng and fetch nearby gyms
  async function handleManualSearch(e) {
    e.preventDefault();
    if (!manualLocation.trim()) return;

    setStatus("loading");
    setError(null);

    try {
      // Free geocoding lookup via OpenStreetMap Nominatim
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          manualLocation
        )}`
      );
      const data = await response.json();

      if (!data || data.length === 0) {
        setError("Location not found. Please try a different city or address.");
        setStatus("error");
        return;
      }

      const { lat, lon } = data[0];
      fetchNearby(parseFloat(lat), parseFloat(lon));
    } catch (err) {
      setError("Failed to geocode location. Check your internet connection.");
      setStatus("error");
    }
  }

  useEffect(() => {
    useMyLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen">
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Gym discovery"
          title="Gyms near you"
          description="Bookable FitPass studios plus nearby gyms you can request we add."
        />

        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            onClick={useMyLocation}
            type="button"
            className="inline-flex items-center justify-center gap-2 border-2 border-[#CCFF00] text-[#CCFF00] font-black uppercase text-xs px-5 py-3 shrink-0 hover:bg-[#CCFF00] hover:text-black transition-colors"
          >
            <MapPin size={14} /> Use my location
          </button>

          {/* Form wrapper allows submitting via both button click and Enter key */}
          <form onSubmit={handleManualSearch} className="flex-1 flex gap-2">
            <input
              type="text"
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Or type a city / address..."
              className="flex-1 bg-zinc-950 border-2 border-zinc-800 px-4 py-3 text-xs uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CCFF00]"
            />
            <button
              type="submit"
              disabled={status === "loading" || status === "locating"}
              className="inline-flex items-center gap-2 bg-[#CCFF00] text-black font-black uppercase text-xs px-6 py-3 shrink-0 hover:bg-[#b3e600] disabled:opacity-50 transition-colors"
            >
              <Search size={14} /> Search
            </button>
          </form>
        </div>

        {status === "locating" || status === "loading" ? (
          <div className="mt-16 flex items-center gap-3 text-zinc-400 text-xs uppercase tracking-widest">
            <Loader2 className="animate-spin" size={16} />
            {status === "locating" ? "Getting your location..." : "Finding gyms nearby..."}
          </div>
        ) : null}

        {status === "error" && (
          <div className="mt-16 flex items-center gap-3 text-red-400 text-xs uppercase tracking-widest">
            <AlertCircle size={16} />
            {error}
            <button
              onClick={useMyLocation}
              className="underline ml-2 inline-flex items-center gap-1 hover:text-red-300"
            >
              <RefreshCw size={12} /> Retry
            </button>
          </div>
        )}

        {status === "ready" && (
          <div className="mt-12 grid md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-[#CCFF00] mb-4">
                Bookable on FitPass ({studios.length})
              </h3>
              <div className="space-y-3">
                {studios.length === 0 && (
                  <p className="text-zinc-500 text-xs uppercase">None within range yet.</p>
                )}
                {studios.map((s) => (
                  <div key={s.id} className="border-2 border-zinc-800 p-4">
                    <p className="font-black uppercase">{s.name}</p>
                    <p className="text-zinc-500 text-xs mt-1">{s.location}</p>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-4">
                Not yet on FitPass ({discovered.length})
              </h3>
              <div className="space-y-3">
                {discovered.length === 0 && (
                  <p className="text-zinc-500 text-xs uppercase">
                    No unclaimed gyms found nearby (or GOOGLE_PLACES_API_KEY isn't configured on
                    the server yet).
                  </p>
                )}
                {discovered.map((g) => (
                  <div
                    key={g.place_id}
                    className="border-2 border-dashed border-zinc-700 p-4 flex items-center justify-between"
                  >
                    <div>
                      <p className="font-black uppercase">{g.name}</p>
                      <p className="text-zinc-500 text-xs mt-1">{g.address}</p>
                    </div>
                    <button className="text-[#CCFF00] text-[10px] font-black uppercase border border-[#CCFF00] px-3 py-2 shrink-0 hover:bg-[#CCFF00] hover:text-black transition-colors">
                      Request this gym
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}