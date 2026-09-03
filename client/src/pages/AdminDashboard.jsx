import { useEffect, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import api from "../lib/api";

const emptyClass = {
  title: "",
  description: "", // Added description field
  studio_id: "",
  category_id: "",
  trainer_id: "",
  image_url: "",
  capacity: "",
  start_time: "",
  end_time: "",
};

const defaultStudioOptions = [
  { id: "1", name: "Iron Pulse Lab (Downtown)" },
  { id: "2", name: "Zen & Core Oasis (Uptown)" },
];

const defaultCategoryOptions = [
  { id: "1", name: "HIIT" },
  { id: "2", name: "Strength & Conditioning" },
  { id: "3", name: "Boxing" },
];
const emptyStudio = { name: "", location: "", description: "" };

export default function AdminDashboard({ trainerMode = false }) {
  const { user, showToast } = useApp();
  const [classes, setClasses] = useState([]);
  const [studios, setStudios] = useState([]);
  const [categories, setCategories] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [tab, setTab] = useState("classes");

  const [classForm, setClassForm] = useState(emptyClass);
  const [editingClassId, setEditingClassId] = useState(null);

  const [studioForm, setStudioForm] = useState(emptyStudio);
  const [busy, setBusy] = useState(false);

  // Expanded class tracking for booking management
  const [expandedClassId, setExpandedClassId] = useState(null);
  const [classBookings, setClassBookings] = useState({});
  const [addMemberEmail, setAddMemberEmail] = useState("");

  const load = async () => {
    try {
      const baseRequests = [
        api.getClasses(),
        api.getStudios(),
        api.getCategories(),
      ];
      if (!trainerMode) baseRequests.push(api.getTrainers());
      const [classData, studioData, categoryData, trainerData = []] =
        await Promise.all(baseRequests);

      setClasses(
        trainerMode
          ? classData.filter((item) => item.trainer_name === user?.full_name)
          : classData
      );
      setStudios(studioData);
      setCategories(categoryData);
      setTrainers(trainerData);
    } catch (error) {
      showToast(error.message || "Could not load management data.");
    }
  };

  useEffect(() => {
    load();
  }, [trainerMode, user?.full_name]);

  // Load bookings for a specific class when expanded
  const toggleExpandClass = async (classId) => {
    if (expandedClassId === classId) {
      setExpandedClassId(null);
      return;
    }
    setExpandedClassId(classId);
    fetchClassBookings(classId);
  };

  const fetchClassBookings = async (classId) => {
    try {
      const bookings = await api.getClassBookings(classId);
      setClassBookings((prev) => ({ ...prev, [classId]: bookings }));
    } catch (error) {
      showToast(error.message || "Could not load bookings for this class.");
    }
  };

  const handleEditClick = (cls) => {
    setEditingClassId(cls.id);
    setClassForm({
      title: cls.title || "",
      description: cls.description || "", // Populates description when editing
      studio_id: cls.studio_id || "",
      category_id: cls.category_id || "",
      trainer_id: cls.trainer_id || "",
      image_url: cls.image_url || "",
      capacity: cls.capacity || "",
      start_time: cls.start_time ? cls.start_time.slice(0, 16) : "",
      end_time: cls.end_time ? cls.end_time.slice(0, 16) : "",
    });
  };

  const cancelEdit = () => {
    setEditingClassId(null);
    setClassForm(emptyClass);
  };

  const saveClass = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      const payload = {
        ...classForm,
        studio_id: Number(classForm.studio_id),
        category_id: Number(classForm.category_id),
        capacity: Number(classForm.capacity),
      };
      if (!trainerMode) payload.trainer_id = Number(classForm.trainer_id);
      else delete payload.trainer_id;

      if (editingClassId) {
        await api.updateClass(editingClassId, payload);
        showToast("Class updated successfully.");
      } else {
        await api.createClass(payload);
        showToast("Class created.");
      }

      cancelEdit();
      await load();
    } catch (error) {
      showToast(error.message || "Could not save class.");
    } finally {
      setBusy(false);
    }
  };

  const createStudio = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await api.createStudio(studioForm);
      setStudioForm(emptyStudio);
      showToast("Studio created.");
      await load();
    } catch (error) {
      showToast(error.message || "Could not create studio.");
    } finally {
      setBusy(false);
    }
  };

  const removeClass = async (id) => {
    if (!window.confirm("Delete this class? This cannot be undone.")) return;
    try {
      await api.deleteClass(id);
      setClasses((items) => items.filter((item) => item.id !== id));
      showToast("Class deleted.");
    } catch (error) {
      showToast(error.message || "Could not delete class.");
    }
  };

  const removeStudio = async (id) => {
    if (!window.confirm("Delete this empty studio?")) return;
    try {
      await api.deleteStudio(id);
      setStudios((items) => items.filter((item) => item.id !== id));
      showToast("Studio deleted.");
    } catch (error) {
      showToast(error.message || "Could not delete studio.");
    }
  };

  const handleAddMember = async (e, classId) => {
    e.preventDefault();
    if (!addMemberEmail) return;
    try {
      await api.addMemberToClass(classId, { email: addMemberEmail });
      showToast("Member added to class.");
      setAddMemberEmail("");
      fetchClassBookings(classId);
    } catch (error) {
      showToast(error.message || "Could not add member.");
    }
  };

  const handleRemoveMember = async (classId, bookingId) => {
    if (!window.confirm("Remove this member from the class?")) return;
    try {
      await api.removeBooking(bookingId);
      showToast("Member removed.");
      fetchClassBookings(classId);
    } catch (error) {
      showToast(error.message || "Could not remove member.");
    }
  };

  const field =
    "w-full bg-zinc-900 border border-zinc-700 px-3 py-3 text-sm text-white focus:outline-none focus:border-[#CCFF00]";

  return (
    <main className="min-h-screen bg-[#0B0B0C] pt-28 px-6 pb-16 text-white">
      <div className="max-w-6xl mx-auto">
        <p className="text-xs font-black tracking-widest text-[#CCFF00] uppercase">
          {trainerMode ? "Trainer workspace" : "Admin dashboard"}
        </p>
        <h1 className="mt-2 text-3xl text-white uppercase">
          {trainerMode
            ? "Create and manage your classes"
            : "Studio and class control"}
        </h1>
        <p className="mt-2 text-sm text-zinc-400">
          Signed in as {user?.full_name}.
        </p>
        <div className="mt-8 flex gap-3 border-b border-zinc-800 pb-4">
          <button className="btn-primary" onClick={() => setTab("classes")}>
            Classes
          </button>
          {!trainerMode && (
            <button className="btn-primary" onClick={() => setTab("studios")}>
              Studios
            </button>
          )}
        </div>

        {tab === "classes" && (
          <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={saveClass}
              className="space-y-4 border border-zinc-800 bg-zinc-950 p-6 h-fit"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-white uppercase font-bold">
                  {editingClassId ? "Edit Class" : "Create a class"}
                </h2>
                {editingClassId && (
                  <button
                    type="button"
                    onClick={cancelEdit}
                    className="text-xs text-zinc-400 underline"
                  >
                    Cancel
                  </button>
                )}
              </div>

              <input
                required
                className={field}
                placeholder="Class title"
                value={classForm.title}
                onChange={(e) =>
                  setClassForm({ ...classForm, title: e.target.value })
                }
              />
              <textarea
                className={`${field} rows-3 resize-none`}
                placeholder="Class description (optional)"
                value={classForm.description}
                onChange={(e) =>
                  setClassForm({ ...classForm, description: e.target.value })
                }
              />
              <select
                required
                className={field}
                value={classForm.studio_id}
                onChange={(e) =>
                  setClassForm({ ...classForm, studio_id: e.target.value })
                }
              >
                <option value="">Select studio</option>
                {(studios.length ? studios : defaultStudioOptions).map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
              <select
                required
                className={field}
                value={classForm.category_id}
                onChange={(e) =>
                  setClassForm({ ...classForm, category_id: e.target.value })
                }
              >
                <option value="">Select category</option>
                {(categories.length ? categories : defaultCategoryOptions).map(
                  (c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  )
                )}
              </select>
              <input
                className={field}
                placeholder="Image URL (optional)"
                value={classForm.image_url}
                onChange={(e) =>
                  setClassForm({ ...classForm, image_url: e.target.value })
                }
              />
              {!trainerMode && (
                <select
                  required
                  className={field}
                  value={classForm.trainer_id}
                  onChange={(e) =>
                    setClassForm({ ...classForm, trainer_id: e.target.value })
                  }
                >
                  <option value="">Assign trainer</option>
                  {trainers.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.full_name}
                    </option>
                  ))}
                </select>
              )}
              <input
                required
                min="1"
                type="number"
                className={field}
                placeholder="Capacity"
                value={classForm.capacity}
                onChange={(e) =>
                  setClassForm({ ...classForm, capacity: e.target.value })
                }
              />
              <label className="block text-xs text-zinc-400">
                Start time
                <input
                  required
                  type="datetime-local"
                  className={`${field} mt-1`}
                  value={classForm.start_time}
                  onChange={(e) =>
                    setClassForm({ ...classForm, start_time: e.target.value })
                  }
                />
              </label>
              <label className="block text-xs text-zinc-400">
                End time
                <input
                  required
                  type="datetime-local"
                  className={`${field} mt-1`}
                  value={classForm.end_time}
                  onChange={(e) =>
                    setClassForm({ ...classForm, end_time: e.target.value })
                  }
                />
              </label>
              <button disabled={busy} className="btn-primary w-full">
                {busy
                  ? "Saving..."
                  : editingClassId
                  ? "Update class"
                  : "Create class"}
              </button>
            </form>

            <div className="space-y-3">
              <h2 className="text-yellow-500 uppercase font-bold">
                Scheduled classes
              </h2>
              {classes.map((item) => (
                <article
                  key={item.id}
                  className="border border-zinc-800 bg-zinc-950 p-5"
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-bold text-[#CCFF00]">{item.title}</h3>
                      {item.description && (
                        <p className="mt-1 text-xs text-zinc-300">
                          {item.description}
                        </p>
                      )}
                      <p className="mt-1 text-sm text-zinc-400">
                        {item.studio_name} · {item.trainer_name} ·{" "}
                        {new Date(item.start_time).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleEditClick(item)}
                        className="text-xs font-bold text-zinc-300 hover:text-white"
                      >
                        EDIT
                      </button>
                      <button
                        onClick={() => removeClass(item.id)}
                        className="text-xs font-bold text-red-400"
                      >
                        DELETE
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-900 flex justify-between items-center">
                    <button
                      onClick={() => toggleExpandClass(item.id)}
                      className="text-xs uppercase font-bold text-zinc-400 hover:text-[#CCFF00]"
                    >
                      {expandedClassId === item.id
                        ? "Hide Members"
                        : "View Enrolled Members"}
                    </button>
                  </div>

                  {/* Expanded Section for Bookings/Members */}
                  {expandedClassId === item.id && (
                    <div className="mt-4 p-4 border border-zinc-800 bg-zinc-900/50 space-y-4">
                      <h4 className="text-xs font-black uppercase tracking-wider text-zinc-300">
                        Enrolled Members
                      </h4>

                      {/* Add Member Form */}
                      <form
                        onSubmit={(e) => handleAddMember(e, item.id)}
                        className="flex gap-2"
                      >
                        <input
                          type="email"
                          required
                          placeholder="Member Email"
                          className="flex-1 bg-zinc-950 border border-zinc-700 px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                          value={addMemberEmail}
                          onChange={(e) => setAddMemberEmail(e.target.value)}
                        />
                        <button
                          type="submit"
                          className="bg-[#CCFF00] text-black text-xs font-bold px-3 py-1.5 uppercase shrink-0"
                        >
                          Add Member
                        </button>
                      </form>

                      {/* Members List */}
                      <div className="space-y-2 mt-2">
                        {(!classBookings[item.id] ||
                          classBookings[item.id].length === 0) && (
                          <p className="text-xs text-zinc-500">
                            No members booked yet.
                          </p>
                        )}
                        {classBookings[item.id]?.map((booking) => (
                          <div
                            key={booking.id}
                            className="flex justify-between items-center bg-zinc-950 border border-zinc-800 p-2 text-xs"
                          >
                            <div>
                              <p className="font-bold text-white">
                                {booking.user_name || booking.user_email}
                              </p>
                              <p className="text-zinc-500">{booking.user_email}</p>
                            </div>
                            <button
                              onClick={() =>
                                handleRemoveMember(item.id, booking.id)
                              }
                              className="text-[10px] font-bold text-red-400 uppercase"
                            >
                              Remove
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {tab === "studios" && (
          <section className="mt-8 grid gap-8 lg:grid-cols-[420px_1fr]">
            <form
              onSubmit={createStudio}
              className="space-y-4 border border-zinc-800 bg-zinc-950 p-6"
            >
              <h2 className="font-black uppercase">Add a studio</h2>
              <input
                required
                className={field}
                placeholder="Studio name"
                value={studioForm.name}
                onChange={(e) =>
                  setStudioForm({ ...studioForm, name: e.target.value })
                }
              />
              <input
                required
                className={field}
                placeholder="Location"
                value={studioForm.location}
                onChange={(e) =>
                  setStudioForm({ ...studioForm, location: e.target.value })
                }
              />
              <textarea
                className={field}
                placeholder="Description (optional)"
                value={studioForm.description}
                onChange={(e) =>
                  setStudioForm({ ...studioForm, description: e.target.value })
                }
              />
              <button disabled={busy} className="btn-primary w-full">
                Add studio
              </button>
            </form>
            <div className="space-y-3">
              <h2 className="font-black uppercase">Studios</h2>
              {studios.map((item) => (
                <article
                  key={item.id}
                  className="border border-zinc-800 bg-zinc-950 p-5 flex justify-between gap-4"
                >
                  <div>
                    <h3 className="font-bold text-[#CCFF00]">{item.name}</h3>
                    <p className="mt-1 text-sm text-zinc-400">
                      {item.location}
                    </p>
                  </div>
                  <button
                    onClick={() => removeStudio(item.id)}
                    className="text-xs font-bold text-red-400"
                  >
                    DELETE
                  </button>
                </article>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  );
}