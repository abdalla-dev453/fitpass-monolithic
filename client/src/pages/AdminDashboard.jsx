import React, { useState, useEffect } from "react";
import api from "../lib/api";

export default function AdminDashboard() {
  const [classes, setClasses] = useState([]);
  const [studios, setStudios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState("create");
  const [errorMessages, setErrorMessages] = useState(null);

  const [formData, setFormData] = useState({
    title: "",
    studio_id: "",
    category_id: "",
    trainer_id: "",
    capacity: "",
    start_time: "",
    end_time: "",
  });

  // Pull existing structural data straight from Flask on component mount
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      // Execute parallel network dispatches to hydrate dropdown modules
      const [classesData, studiosData, categoriesData] = await Promise.all([
        api.getClasses(),
        api.getStudios(),
        api.getCategories()
      ]);

      setClasses(classesData);
      setStudios(studiosData);
      setCategories(categoriesData);
    } catch (err) {
      console.error("Pipeline failure fetching operational configurations:", err.message);
    }
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    setErrorMessages(null);

    // Prepare payload matching your exact Marshmallow schema validation data keys
    const payload = {
      title: formData.title.toUpperCase(),
      studio_id: parseInt(formData.studio_id),
      category_id: parseInt(formData.category_id),
      trainer_id: formData.trainer_id ? parseInt(formData.trainer_id) : 1, // Fallback integer if omitted
      capacity: parseInt(formData.capacity),
      start_time: formData.start_time,
      end_time: formData.end_time,
    };

    try {
      const response = await api.createClass(payload);

      // Handle array structure variance safely depending on your controllers wrapper dictionary
      const newClassObject = response.data || response;
      setClasses([newClassObject, ...classes]);

      // Flush selection matrix metrics clean
      setFormData({ title: "", studio_id: "", category_id: "", trainer_id: "", capacity: "", start_time: "", end_time: "" });
      setActiveTab("manage");
      alert(response.message || "Class Deployed Securely!");
    } catch (err) {
      try {
        const structuralErrors = JSON.parse(err.message);
        setErrorMessages(structuralErrors);
      } catch {
        alert(`Access Denied or Database Connection Dropped: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0B0C] pt-28 px-6 md:px-12 selection:bg-[#CCFF00] selection:text-black text-white">
      <div className="max-w-7xl mx-auto">

        {/* Header Node */}
        <div className="border-b border-zinc-800/60 pb-6 mb-8">
          <span className="text-[9px] font-black tracking-[0.2em] bg-zinc-900 border border-zinc-800 text-[#CCFF00] px-2.5 py-1 uppercase">
            System Console Active
          </span>
          <h1 className="text-3xl font-black text-white tracking-tighter uppercase mt-4">
            CORE CONTROL PIPELINE
          </h1>
          <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider font-medium">
            Administrative terminal matrix for the Fitpass synchronized network distribution ecosystem.
          </p>
        </div>

        {/* Error Validation Debugger Overlay */}
        {errorMessages && (
          <div className="mb-6 p-4 bg-red-950/40 border border-red-900 text-red-400 text-xs uppercase tracking-wide rounded-xl">
            <span className="font-bold">// Validation Pipeline Failure:</span>
            <pre className="mt-2 font-mono text-[10px] whitespace-pre-wrap">
              {JSON.stringify(errorMessages, null, 2)}
            </pre>
          </div>
        )}

        {/* Dashboard Navigation Tabs */}
        <div className="flex gap-4 border-b border-zinc-900 pb-4 mb-8">
          {["create", "manage"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-widest transition-all ${
                activeTab === tab
                  ? "bg-[#CCFF00] text-black"
                  : "bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800"
              }`}
            >
              {tab === "create" ? "Deploy New Class" : "Manage Sessions & Bookings"}
            </button>
          ))}
        </div>

        {/* TAB 1: CREATE A FITNESS CLASS */}
        {activeTab === "create" && (
          <div className="max-w-2xl bg-zinc-950/40 border border-zinc-800/60 p-8 rounded-2xl shadow-xl backdrop-blur-xl">
            <h2 className="text-sm font-black tracking-widest text-[#CCFF00] uppercase mb-6">
              // INITIALIZE CLASS INSTANCE
            </h2>
            <form onSubmit={handleCreateClass} className="space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-400 tracking-wider mb-2">Class Variant Name</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g. HIIT OVERLOAD"
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] uppercase text-white"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* STUDIO SELECT DROPDOWN */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 tracking-wider mb-2">Studio Cluster Node</label>
                  <select
                    name="studio_id"
                    value={formData.studio_id}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] text-zinc-400 uppercase cursor-pointer"
                    required
                  >
                    <option value="">-- Resolve Cluster ID --</option>
                    {studios.map((studio) => (
                      <option key={studio.id} value={studio.id} className="bg-zinc-950 text-white">
                        {studio.name || `STUDIO TARGET ID ${studio.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* CATEGORY SELECT DROPDOWN */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 tracking-wider mb-2">Class Classification Variant</label>
                  <select
                    name="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] text-zinc-400 uppercase cursor-pointer"
                    required
                  >
                    <option value="">-- Resolve Category --</option>
                    {categories.map((cat) => (
                      <option key={cat.id} value={cat.id} className="bg-zinc-950 text-white">
                        {cat.name || `CATEGORY ID ${cat.id}`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* TRAINER MANIFEST IDENTIFIER */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 tracking-wider mb-2">Trainer Operator ID</label>
                  <input
                    type="number"
                    name="trainer_id"
                    value={formData.trainer_id}
                    onChange={handleInputChange}
                    placeholder="e.g. 1"
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] text-white"
                    required
                  />
                </div>

                {/* ATTENDEE MAXIMUM CAPACITY */}
                <div>
                  <label className="block text-[10px] font-bold text-zinc-400 tracking-wider mb-2">Attendee Capacity</label>
                  <input
                    type="number"
                    name="capacity"
                    value={formData.capacity}
                    onChange={handleInputChange}
                    placeholder="25"
                    className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] text-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-zinc-400 tracking-wider mb-2">Schedule Timeline Allocation</label>
                <input
                  type="datetime-local"
                  name="start_time"
                  value={formData.start_time}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] text-white"
                  required
                />
                <input
                  type="datetime-local"
                  name="end_time"
                  value={formData.end_time}
                  onChange={handleInputChange}
                  className="w-full bg-zinc-900 border border-zinc-800 text-sm p-3 focus:outline-none focus:border-[#CCFF00] text-white"
                  required
                />
              </div>

              <button
                type="submit"
                className="bg-[#CCFF00] text-black font-bold uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-[#b3e600] transition-all"
              >
                Deploy Class
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: MANAGE CLASSES AND BOOKINGS */}
        {activeTab === "manage" && (
          <div className="space-y-6">
            <h2 className="text-sm font-black tracking-widest text-[#CCFF00] uppercase mb-4">
              // SESSION & BOOKING MANAGEMENT
            </h2>
            {classes.length === 0 ? (
              <p className="text-zinc-400 text-xs">No active classes found. Deploy a new class to manage bookings.</p>
            ) : (
              classes.map((cls) => (
                <div key={cls.id} className="bg-zinc-950/40 border border-zinc-800/60 p-6 rounded-2xl shadow-lg backdrop-blur-xl">
                  <h3 className="text-sm font-bold text-[#CCFF00] uppercase tracking-wider mb-2">{cls.title}</h3>
                  <p className="text-xs text-zinc-400 mb-4">
                    Studio: {cls.studio_name || `ID ${cls.studio_id}`} | Category: {cls.category_name || `ID ${cls.category_id}`} | Capacity: {cls.capacity} | Start Time: {new Date(cls.start_time).toLocaleString()} | End Time: {new Date(cls.end_time).toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
