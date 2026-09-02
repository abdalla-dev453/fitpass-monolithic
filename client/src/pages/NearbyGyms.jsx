import React, { useEffect, useState } from "react";
import { MapPin, AlertCircle, RefreshCw, Loader2 } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import api from "../lib/api.js";

// SCAFFOLD: wired to GET /discovery/nearby. Styling kept minimal on
// purpose -- swap the markup below for StudioCard-style layout to match
// the rest of the app once the feature is validated.
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
      { timeout: 8000 },
    );
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
            className="inline-flex items-center gap-2 border-2 border-[#CCFF00] text-[#CCFF00] font-black uppercase text-xs px-5 py-3"
          >
            <MapPin size={14} /> Use my location
          </button>
          <div className="flex-1 flex gap-2">
            <input
              value={manualLocation}
              onChange={(e) => setManualLocation(e.target.value)}
              placeholder="Or type a city / address..."
              className="flex-1 bg-zinc-950 border-2 border-zinc-800 px-4 py-3 text-xs uppercase tracking-widest text-white placeholder:text-zinc-600"
            />
            {/* NOTE: manual text search needs a geocoding step (e.g. Google
               Geocoding API) to turn this into lat/lng before calling
               getNearbyGyms -- left as a follow-up since it's a separate
               integration from the nearby-search feature itself. */}
          </div>
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
            <button onClick={useMyLocation} className="underline ml-2 inline-flex items-center gap-1">
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
                    <button className="text-[#CCFF00] text-[10px] font-black uppercase border border-[#CCFF00] px-3 py-2 shrink-0">
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