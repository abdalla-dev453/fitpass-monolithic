import React, { useEffect, useState } from "react";
import api from "../lib/api";
import { useApp } from "../context/AppContext.jsx";

const emptyClass = { title: "", studio_id: "", category_id: "", trainer_id: "", capacity: "", start_time: "", end_time: "" };
const emptyStudio = { name: "", location: "", description: "" };

export default function AdminDashboard({ trainerMode = false }) {
  const { user, showToast } = useApp();
  const [classes, setClasses] = useState([]);
  const [studios, setStudios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [tab, setTab] = useState("classes");
  const [classForm, setClassForm] = useState(emptyClass);
  const [studioForm, setStudioForm] = useState(emptyStudio);
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try {
      const baseRequests = [api.getClasses(), api.getStudios(), api.getCategories()];
      if (!trainerMode) baseRequests.push(api.getTrainers());
      const [classData, studioData, categoryData, trainerData = []] = await Promise.all(baseRequests);
      // The API still exposes the public timetable, but a trainer's workspace
      // only presents classes they are authorised to manage.
      setClasses(trainerMode ? classData.filter((item) => item.trainer_name === user?.full_name) : classData);
      setStudios(studioData);
      setCategories(categoryData);
      setTrainers(trainerData);
    } catch (error) {
      showToast(error.message || "Could not load management data.");
    }
  };

  useEffect(() => { load(); }, [trainerMode, user?.full_name]);

  const createClass = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...classForm,
        studio_id: Number(classForm.studio_id), category_id: Number(classForm.category_id),
        capacity: Number(classForm.capacity),
      };
      if (!trainerMode) payload.trainer_id = Number(classForm.trainer_id);
      else delete payload.trainer_id;
      await api.createClass(payload);
      setClassForm(emptyClass);
      showToast("Class created.");
      await load();
    } catch (error) { showToast(error.message || "Could not create class."); }
    finally { setBusy(false); }
  };

  const createStudio = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createStudio(studioForm);
      setStudioForm(emptyStudio);
      showToast("Studio created.");
      await load();
    } catch (error) { showToast(error.message || "Could not create studio."); }
    finally { setBusy(false); }
  };

  const removeClass = async (id) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    try { await api.deleteClass(id); setClasses((items) => items.filter((item) => item.id !== id)); showToast("Class deleted."); }
    catch (error) { showToast(error.message || "Could not delete class."); }
  };

  const removeStudio = async (id) => {
    if (!window.confirm("Delete this empty studio?")) return;
    try { await api.deleteStudio(id); setStudios((items) => items.filter((item) => item.id !== id)); showToast("Studio deleted."); }
    catch (error) { showToast(error.message || "Could not delete studio."); }
  };

  const field = "w-full bg-zinc-900 border border-zinc-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]";
  return <main className="min-h-screen bg-[#0B0B0C] pt-28 px-6 pb-16 text-white"><div className="max-w-6xl mx-auto">
    <p className="text-xs font-black tracking-widest text-[#CCFF00] uppercase">{trainerMode ? "Trainer workspace" : "Admin dashboard"}</p>
    <h1 className="mt-2 text-3xl font-black uppercase">{trainerMode ? "Create and manage your classes" : "Studio and class control"}</h1>
    <p className="mt-2 text-sm text-zinc-400">Signed in as {user?.full_name}.</p>
    <div className="mt-8 flex gap-3 border-b border-zinc-800 pb-4">
      <button className="btn-primary" onClick={() => setTab("classes")}>Classes</button>
      {!trainerMode && <button className="btn-primary" onClick={() => setTab("studios")}>Studios</button>}
    </div>
    {tab === "classes" && <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]"><form onSubmit={createClass} className="space-y-4 border border-zinc-800 bg-zinc-950 p-6">
      <h2 className="font-black uppercase">Create a class</h2>
      <input required className={field} placeholder="Class title" value={classForm.title} onChange={(e) => setClassForm({...classForm, title:e.target.value})} />
      <select required className={field} value={classForm.studio_id} onChange={(e) => setClassForm({...classForm, studio_id:e.target.value})}><option value="">Select studio</option>{studios.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select>
      <select required className={field} value={classForm.category_id} onChange={(e) => setClassForm({...classForm, category_id:e.target.value})}><option value="">Select category</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
      {!trainerMode && <select required className={field} value={classForm.trainer_id} onChange={(e) => setClassForm({...classForm, trainer_id:e.target.value})}><option value="">Assign trainer</option>{trainers.map((t) => <option key={t.id} value={t.id}>{t.full_name}</option>)}</select>}
      <input required min="1" type="number" className={field} placeholder="Capacity" value={classForm.capacity} onChange={(e) => setClassForm({...classForm, capacity:e.target.value})} />
      <label className="block text-xs text-zinc-400">Start time<input required type="datetime-local" className={`${field} mt-1`} value={classForm.start_time} onChange={(e) => setClassForm({...classForm, start_time:e.target.value})} /></label>
      <label className="block text-xs text-zinc-400">End time<input required type="datetime-local" className={`${field} mt-1`} value={classForm.end_time} onChange={(e) => setClassForm({...classForm, end_time:e.target.value})} /></label>
      <button disabled={busy} className="btn-primary w-full">{busy ? "Saving..." : "Create class"}</button>
    </form><div className="space-y-3"><h2 className="font-black uppercase">Scheduled classes</h2>{classes.map((item) => <article key={item.id} className="border border-zinc-800 bg-zinc-950 p-5"><div className="flex justify-between gap-4"><div><h3 className="font-bold text-[#CCFF00]">{item.title}</h3><p className="mt-1 text-sm text-zinc-400">{item.studio_name} · {item.trainer_name} · {new Date(item.start_time).toLocaleString()}</p></div><button onClick={() => removeClass(item.id)} className="text-xs font-bold text-red-400">DELETE</button></div></article>)}</div></section>}
    {tab === "studios" && <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]"><form onSubmit={createStudio} className="space-y-4 border border-zinc-800 bg-zinc-950 p-6"><h2 className="font-black uppercase">Add a studio</h2><input required className={field} placeholder="Studio name" value={studioForm.name} onChange={(e) => setStudioForm({...studioForm, name:e.target.value})}/><input required className={field} placeholder="Location" value={studioForm.location} onChange={(e) => setStudioForm({...studioForm, location:e.target.value})}/><textarea className={field} placeholder="Description (optional)" value={studioForm.description} onChange={(e) => setStudioForm({...studioForm, description:e.target.value})}/><button disabled={busy} className="btn-primary w-full">Add studio</button></form><div className="space-y-3"><h2 className="font-black uppercase">Studios</h2>{studios.map((item) => <article key={item.id} className="border border-zinc-800 bg-zinc-950 p-5 flex justify-between gap-4"><div><h3 className="font-bold text-[#CCFF00]">{item.name}</h3><p className="mt-1 text-sm text-zinc-400">{item.location}</p></div><button onClick={() => removeStudio(item.id)} className="text-xs font-bold text-red-400">DELETE</button></article>)}</div></section>}
  </div></main>;
}
