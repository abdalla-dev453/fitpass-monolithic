import React, { useEffect, useState, useCallback } from "react";
import { Loader2, Search, Plus, Utensils, Flame, Sparkles, AlertCircle, RefreshCw } from "lucide-react";
import SectionHeading from "../components/SectionHeading.jsx";
import api from "../lib/api.js";
import { useApp } from "../context/AppContext.jsx";

export default function Nutrition() {
  const { showToast } = useApp();
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [status, setStatus] = useState("loading");
  const [selectedMealType, setSelectedMealType] = useState("snack");
  const [selectedQuantity, setSelectedQuantity] = useState(100);
  const [savingTargets, setSavingTargets] = useState(false);

  // Meal plan generator state
  const [mealPlan, setMealPlan] = useState(null);
  const [generatingPlan, setGeneratingPlan] = useState(false);

  const loadAll = useCallback(() => {
    setStatus("loading");
    Promise.all([
      api.getNutritionProfile().catch(() => null),
      api.getNutritionSummary("week").catch(() => null),
    ])
      .then(([profileData, summaryData]) => {
        setProfile(profileData || { goal: "maintain", daily_calorie_target: 2200, protein_target_g: 150 });
        setSummary(summaryData);
        setStatus("ready");
      })
      .catch((err) => {
        console.error("Failed to load nutrition data:", err);
        setStatus("error");
      });
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  function saveTargets(e) {
    e.preventDefault();
    setSavingTargets(true);
    const form = new FormData(e.target);
    api
      .updateNutritionProfile({
        goal: form.get("goal"),
        daily_calorie_target: Number(form.get("daily_calorie_target")) || undefined,
        protein_target_g: Number(form.get("protein_target_g")) || undefined,
      })
      .then((data) => {
        setProfile(data);
        showToast("ATHLETIC MACRO TARGETS UPDATED.");
        loadAll();
      })
      .catch((err) => showToast(err.message || "COULD NOT UPDATE TARGETS."))
      .finally(() => setSavingTargets(false));
  }

  function runSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    api
      .searchFoods(query)
      .then((items) => {
        setResults(items || []);
        if (!items || items.length === 0) {
          showToast("No exact matches found. Try common whole foods.");
        }
      })
      .catch((err) => showToast(err.message || "SEARCH ERROR."))
      .finally(() => setSearching(false));
  }

  function logFood(foodItemId) {
    api
      .logFood({
        foodItemId,
        quantityG: Number(selectedQuantity) || 100,
        mealType: selectedMealType,
      })
      .then(() => {
        showToast(`LOGGED ${selectedQuantity}g TO ${selectedMealType.toUpperCase()}.`);
        loadAll();
      })
      .catch((err) => showToast(err.message || "LOGGING FAULT."));
  }

  const handleGenerateMealPlan = async () => {
    setGeneratingPlan(true);
    try {
      const plan = await api.getMealPlan(3);
      setMealPlan(plan);
      showToast("3-MEAL STARTER PROTOCOL GENERATED.");
    } catch (err) {
      showToast(err.message || "COULD NOT GENERATE MEAL PROTOCOL.");
    } finally {
      setGeneratingPlan(false);
    }
  };

  if (status === "loading") {
    return (
      <div className="bg-[#0B0C10] min-h-screen flex flex-col items-center justify-center text-zinc-500 gap-3">
        <Loader2 className="animate-spin text-[#CCFF00]" size={28} strokeWidth={2.5} />
        <span className="text-xs font-black uppercase tracking-widest">LOADING ATHLETE NUTRITION TELEMETRY...</span>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="bg-[#0B0C10] min-h-screen pt-32 px-6 flex flex-col items-center justify-center text-center">
        <div className="border-2 border-red-900 bg-zinc-950 p-8 max-w-md w-full space-y-4">
          <AlertCircle size={28} className="text-red-500 mx-auto" />
          <h2 className="font-display font-black text-xl uppercase text-white">NUTRITION SYSTEM OFFLINE</h2>
          <p className="text-xs text-zinc-400 uppercase">
            Failed to communicate with nutrition endpoints. Verify backend runtime.
          </p>
          <button
            onClick={loadAll}
            className="w-full inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-black font-display font-black text-xs uppercase py-3 hover:bg-white"
          >
            <RefreshCw size={14} /> RETRY CONNECTION
          </button>
        </div>
      </div>
    );
  }

  const avgCals = summary?.daily_average?.calories || 0;
  const targetCals = profile?.daily_calorie_target || 2000;
  const calPercent = Math.min(Math.round((avgCals / targetCals) * 100), 100);

  const avgProtein = summary?.daily_average?.protein_g || 0;
  const targetProtein = profile?.protein_target_g || 150;
  const proteinPercent = Math.min(Math.round((avgProtein / targetProtein) * 100), 100);

  return (
    <div className="bg-[#0B0C10] text-white min-h-screen selection:bg-[#CCFF00] selection:text-black">
      <section className="pt-32 pb-24 px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
        
        {/* HEADER */}
        <div className="border-b-4 border-zinc-800 pb-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <SectionHeading
            eyebrow="ATHLETIC DIET OPTIMIZATION"
            title="NUTRITION & MACRO TELEMETRY."
            description="LOG NUTRITIONAL FUEL, MONITOR METABOLIC AVERAGES, AND GENERATE BALANCED MEAL PROTOCOLS MATCHED TO INTENSITY."
          />
          <button
            onClick={handleGenerateMealPlan}
            disabled={generatingPlan}
            className="inline-flex items-center gap-2 bg-zinc-950 border-2 border-[#CCFF00] text-[#CCFF00] hover:bg-[#CCFF00] hover:text-black font-display font-black text-xs uppercase px-5 py-3 tracking-widest transition-all shrink-0 disabled:opacity-50"
          >
            {generatingPlan ? (
              <>
                <Loader2 size={14} className="animate-spin" /> GENERATING PROTOCOL...
              </>
            ) : (
              <>
                <Sparkles size={14} /> GENERATE STARTER MEAL PROTOCOL
              </>
            )}
          </button>
        </div>

        {/* TOP ROW: TARGETS & MACRO TELEMETRY */}
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* CARD 1: TARGETS */}
          <form onSubmit={saveTargets} className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-4 shadow-[4px_4px_0px_0px_rgba(204,255,0,0.1)]">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-widest text-[#CCFF00]">
                DAILY TARGET TARGETS
              </h3>
              <Flame size={16} className="text-[#CCFF00]" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                ATHLETIC OBJECTIVE
              </label>
              <select
                name="goal"
                defaultValue={profile?.goal || "maintain"}
                className="w-full bg-zinc-900 border-2 border-zinc-800 px-3 py-2 text-xs uppercase text-white focus:outline-none focus:border-[#CCFF00]"
              >
                <option value="lose">DEFICIT / CUT (FAT LOSS)</option>
                <option value="maintain">MAINTENANCE / PERFORMANCE</option>
                <option value="gain">SURPLUS / HYPERTROPHY (BULK)</option>
                <option value="recomp">BODY RECOMPOSITION</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                DAILY CALORIE CAP (KCAL)
              </label>
              <input
                name="daily_calorie_target"
                type="number"
                min="800"
                max="8000"
                defaultValue={profile?.daily_calorie_target || 2200}
                placeholder="Daily calorie target"
                className="w-full bg-zinc-900 border-2 border-zinc-800 px-3 py-2 text-xs uppercase text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                DAILY PROTEIN BENCHMARK (G)
              </label>
              <input
                name="protein_target_g"
                type="number"
                min="40"
                max="500"
                defaultValue={profile?.protein_target_g || 150}
                placeholder="Protein target (g)"
                className="w-full bg-zinc-900 border-2 border-zinc-800 px-3 py-2 text-xs uppercase text-white focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <button
              type="submit"
              disabled={savingTargets}
              className="w-full bg-[#CCFF00] text-black font-display font-black uppercase text-xs py-3 border border-black hover:bg-white transition-colors"
            >
              {savingTargets ? "UPDATING..." : "COMMIT MACRO BENCHMARKS"}
            </button>
          </form>

          {/* CARD 2: MACRO CONSUMPTION TELEMETRY */}
          <div className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-widest text-white">
                WEEKLY METRIC AVERAGES
              </h3>
              <span className="text-[9px] font-mono text-zinc-500 uppercase">
                {summary ? `${summary.logged_days}/${summary.range_days} DAYS LOGGED` : "7-DAY WINDOW"}
              </span>
            </div>

            {/* Calorie Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">CALORIES:</span>
                <span className="font-bold text-white">
                  {avgCals} / <span className="text-zinc-500">{targetCals} kcal</span>
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-900 border border-zinc-800">
                <div
                  className="h-full bg-[#CCFF00] transition-all duration-500"
                  style={{ width: `${calPercent}%` }}
                />
              </div>
            </div>

            {/* Protein Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-zinc-400">PROTEIN:</span>
                <span className="font-bold text-white">
                  {avgProtein}g / <span className="text-zinc-500">{targetProtein}g</span>
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-900 border border-zinc-800">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500"
                  style={{ width: `${proteinPercent}%` }}
                />
              </div>
            </div>

            {/* Carbs & Fat stats */}
            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-900">
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-800">
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">AVG CARBS</p>
                <p className="font-display font-black text-lg text-white mt-0.5">
                  {summary?.daily_average?.carbs_g || 0}g
                </p>
              </div>
              <div className="bg-zinc-900/60 p-2.5 border border-zinc-800">
                <p className="text-[9px] font-black uppercase text-zinc-500 tracking-wider">AVG FAT</p>
                <p className="font-display font-black text-lg text-white mt-0.5">
                  {summary?.daily_average?.fat_g || 0}g
                </p>
              </div>
            </div>
          </div>

          {/* CARD 3: COACHING SUGGESTIONS */}
          <div className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
              <h3 className="font-display font-black text-sm uppercase tracking-widest text-[#CCFF00]">
                PERFORMANCE NUDGES
              </h3>
              <Utensils size={16} className="text-[#CCFF00]" />
            </div>

            <ul className="space-y-3 text-xs text-zinc-300">
              {summary?.improvements && summary.improvements.length > 0 ? (
                summary.improvements.map((tip, i) => (
                  <li key={i} className="flex items-start gap-2 border-l-2 border-[#CCFF00] pl-3 py-1 bg-zinc-900/30">
                    <span className="uppercase text-[11px] font-medium leading-relaxed">{tip}</span>
                  </li>
                ))
              ) : (
                <li className="text-zinc-500 text-xs uppercase py-4">
                  Log your daily meals below to unlock customized recovery and calorie allocation tips.
                </li>
              )}
            </ul>
          </div>

        </div>

        {/* MEAL PROTOCOL RESULTS (IF GENERATED) */}
        {mealPlan && (
          <div className="border-2 border-[#CCFF00] bg-zinc-950 p-6 space-y-6 shadow-[6px_6px_0px_0px_rgba(204,255,0,0.2)] animate-in fade-in duration-300">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div>
                <span className="text-[9px] font-black uppercase tracking-widest text-[#CCFF00]">
                  SYSTEM GENERATED NUTRITION BLUEPRINT
                </span>
                <h3 className="font-display font-black text-xl uppercase text-white mt-0.5">
                  STARTER MEAL SCHEDULE PROTOCOL
                </h3>
              </div>
              <button
                onClick={() => setMealPlan(null)}
                className="text-xs uppercase text-zinc-500 hover:text-white"
              >
                DISMISS
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              {Array.isArray(mealPlan) ? (
                mealPlan.map((meal, idx) => (
                  <div key={idx} className="border border-zinc-800 bg-zinc-900/50 p-4 space-y-2">
                    <span className="text-[10px] font-black uppercase text-[#CCFF00] tracking-widest">
                      MEAL {idx + 1}: {meal.name || meal.meal_type || "NUTRITION NODE"}
                    </span>
                    <p className="font-display font-black text-base uppercase text-white">
                      {meal.item_name || meal.title || "Balanced Whole Food Allocation"}
                    </p>
                    <p className="text-[10px] font-mono text-zinc-400">
                      {meal.calories ? `${meal.calories} KCAL` : ""} {meal.protein_g ? `· ${meal.protein_g}G PROTEIN` : ""}
                    </p>
                  </div>
                ))
              ) : (
                <div className="md:col-span-3 text-xs text-zinc-400 font-mono">
                  {JSON.stringify(mealPlan)}
                </div>
              )}
            </div>
          </div>
        )}

        {/* LOG FOOD SECTION */}
        <div className="border-2 border-zinc-800 bg-zinc-950 p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-900 pb-4">
            <div>
              <h3 className="font-display font-black text-lg uppercase tracking-tight text-white">
                LOG ATHLETIC INGESTION
              </h3>
              <p className="text-zinc-500 text-xs uppercase tracking-wider">
                SEARCH USDA & LOCAL FOOD DATABASE (E.G. CHICKEN BREAST, OATS, WHEY, EGGS, RICE)
              </p>
            </div>

            {/* Quick Meal Type Selector */}
            <div className="flex gap-1.5 flex-wrap">
              {["breakfast", "lunch", "dinner", "snack"].map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedMealType(type)}
                  className={`text-[10px] font-black uppercase px-3 py-1.5 border transition-all ${
                    selectedMealType === type
                      ? "bg-[#CCFF00] text-black border-[#CCFF00]"
                      : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-white"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Search Bar + Portion Picker */}
          <form onSubmit={runSearch} className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="SEARCH INGREDIENTS (E.G. SALMON, SWEET POTATO, GREEK YOGURT)..."
                className="w-full bg-zinc-900 border-2 border-zinc-800 px-4 py-3 text-xs uppercase tracking-widest text-white placeholder:text-zinc-600 focus:outline-none focus:border-[#CCFF00]"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 shrink-0">PORTION:</span>
              <input
                type="number"
                min="10"
                max="2000"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                className="w-20 bg-zinc-900 border-2 border-zinc-800 px-2 py-3 text-xs font-mono text-center text-white focus:outline-none focus:border-[#CCFF00]"
              />
              <span className="text-xs font-mono text-zinc-400">g</span>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center justify-center gap-2 bg-[#CCFF00] text-black font-display font-black uppercase text-xs px-6 py-3 shrink-0 hover:bg-white transition-colors"
            >
              {searching ? <Loader2 className="animate-spin" size={14} /> : <Search size={14} />}
              SEARCH FOODS
            </button>
          </form>

          {/* Search Results */}
          {results.length > 0 && (
            <div className="space-y-3 pt-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-[#CCFF00]">
                RESULTS ({results.length}) — CLICK + TO LOG {selectedQuantity}G TO {selectedMealType.toUpperCase()}
              </p>
              <div className="grid md:grid-cols-2 gap-3">
                {results.map((food) => {
                  const ratio = (Number(selectedQuantity) || 100) / 100;
                  const cals = Math.round(food.calories_per_100g * ratio);
                  const protein = Math.round(food.protein_g * ratio);
                  const carbs = Math.round(food.carbs_g * ratio);
                  const fat = Math.round(food.fat_g * ratio);
                  return (
                    <div
                      key={food.id}
                      className="flex items-center justify-between border-2 border-zinc-800 bg-zinc-900/60 p-4 hover:border-zinc-700 transition-colors"
                    >
                      <div>
                        <p className="font-display font-black uppercase text-sm text-white tracking-wide">
                          {food.name}
                        </p>
                        <p className="text-zinc-400 font-mono text-[11px] mt-1">
                          <span className="text-[#CCFF00] font-bold">{cals} kcal</span> · P{protein}g · C{carbs}g · F{fat}g
                        </p>
                      </div>

                      <button
                        onClick={() => logFood(food.id)}
                        className="bg-[#CCFF00] text-black p-2.5 border border-black hover:bg-white transition-colors shrink-0 ml-3"
                        title={`Log ${selectedQuantity}g to ${selectedMealType}`}
                      >
                        <Plus size={16} strokeWidth={3} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

      </section>
    </div>
  );
}
