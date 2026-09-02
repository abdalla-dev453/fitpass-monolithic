import React, { useEffect, useState } from "react";
import { Loader2, Search, Plus } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import api from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";

// SCAFFOLD: wired to /nutrition/*. Styling kept minimal on purpose -- this
// proves the endpoints out end-to-end; restyle to match the rest of the
// app once the flow is validated.
export default function Nutrition() {
  const { showToast } = useApp();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("loading");

  function loadAll() {
    setStatus("loading");
    Promise.all([api.getNutritionProfile(), api.getNutritionSummary("week")])
      .then(([profileData, summaryData]) => {
        setProfile(profileData);
        setSummary(summaryData);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  }

  useEffect(() => {
    loadAll();
  }, []);

  function saveTargets(e) {
    e.preventDefault();
    const form = new FormData(e.target);
    api
      .updateNutritionProfile({
        goal: form.get("goal"),
        daily_calorie_target: Number(form.get("daily_calorie_target")) || undefined,
        protein_target_g: Number(form.get("protein_target_g")) || undefined,
      })
      .then((data) => {
        setProfile(data);
        showToast("Targets updated");
        loadAll();
      })
      .catch((err) => showToast(err.message));
  }

  function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    api
      .searchFoods(query)
      .then(setResults)
      .catch((err) => showToast(err.message))
      .finally(() => setSearching(false));
  }

  function logFood(foodItemId, mealType = "snack", quantityG = 100) {
    api
      .logFood({ foodItemId, quantityG, mealType })
      .then(() => {
        showToast("Logged");
        loadAll();
      })
      .catch((err) => showToast(err.message));
  }

  if (status === "loading") {
    return (
      <div className="bg-[#0B0C10] min-h-screen flex items-center justify-center text-zinc-400">
        <Loader2 className="animate-spin" size={20} />
      </div>
    );
  }

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen">
      <section className="pt-32 pb-16 px-6 lg:px-8 max-w-7xl mx-auto">
        <SectionHeading
          eyebrow="Diet tracking"
          title="Nutrition"
          description="Log what you eat, see how it stacks up against your targets."
        />

        <div className="mt-10 grid md:grid-cols-3 gap-8">
          {/* Targets */}
          <form onSubmit={saveTargets} className="border-2 border-zinc-800 p-5 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#CCFF00]">
              Your targets
            </h3>
            <select
              name="goal"
              defaultValue={profile?.goal || "maintain"}
              className="w-full bg-zinc-950 border-2 border-zinc-800 px-3 py-2 text-xs uppercase"
            >
              <option value="lose">Lose</option>
              <option value="maintain">Maintain</option>
              <option value="gain">Gain</option>
              <option value="recomp">Recomp</option>
            </select>
            <input
              name="daily_calorie_target"
              type="number"
              defaultValue={profile?.daily_calorie_target || ""}
              placeholder="Daily calorie target"
              className="w-full bg-zinc-950 border-2 border-zinc-800 px-3 py-2 text-xs"
            />
            <input
              name="protein_target_g"
              type="number"
              defaultValue={profile?.protein_target_g || ""}
              placeholder="Protein target (g)"
              className="w-full bg-zinc-950 border-2 border-zinc-800 px-3 py-2 text-xs"
            />
            <button className="w-full border-2 border-[#CCFF00] text-[#CCFF00] font-black uppercase text-xs py-2">
              Save
            </button>
          </form>

          {/* Weekly summary */}
          <div className="border-2 border-zinc-800 p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#CCFF00] mb-4">
              This week
            </h3>
            {summary && (
              <div className="space-y-2 text-xs">
                <p>Avg calories: {summary.daily_average.calories}</p>
                <p>Avg protein: {summary.daily_average.protein_g}g</p>
                <p>Avg carbs: {summary.daily_average.carbs_g}g</p>
                <p>Avg fat: {summary.daily_average.fat_g}g</p>
                <p className="text-zinc-500">
                  Logged {summary.logged_days}/{summary.range_days} days
                </p>
              </div>
            )}
          </div>

          {/* Improvements */}
          <div className="border-2 border-zinc-800 p-5">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#CCFF00] mb-4">
              Suggestions
            </h3>
            <ul className="space-y-2 text-xs text-zinc-300">
              {summary?.improvements?.map((tip, i) => <li key={i}>• {tip}</li>)}
            </ul>
          </div>
        </div>

        {/* Log a food */}
        <div className="mt-10 border-2 border-zinc-800 p-5">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#CCFF00] mb-4">
            Log a food
          </h3>
          <form onSubmit={runSearch} className="flex gap-2 mb-4">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search foods (e.g. chicken breast)"
              className="flex-1 bg-zinc-950 border-2 border-zinc-800 px-4 py-3 text-xs"
            />
            <button className="border-2 border-zinc-700 px-4 py-3">
              {searching ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
            </button>
          </form>
          <div className="space-y-2">
            {results.map((food) => (
              <div key={food.id} className="flex items-center justify-between border border-zinc-800 p-3">
                <div>
                  <p className="font-black uppercase text-xs">{food.name}</p>
                  <p className="text-zinc-500 text-[10px]">
                    {food.calories_per_100g} kcal / 100g · P{food.protein_g} C{food.carbs_g} F{food.fat_g}
                  </p>
                </div>
                <button
                  onClick={() => logFood(food.id)}
                  className="text-[#CCFF00] border border-[#CCFF00] p-2"
                >
                  <Plus size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}