const API_URL = (
  import.meta.env.VITE_API_URL || "http://127.0.0.1:5000"
).replace(/\/$/, "");

if (import.meta.env.PROD && !import.meta.env.VITE_API_URL) {
  console.warn(
    "VITE_API_URL is not defined. The app is using the local fallback http://127.0.0.1:5000, which will fail in production deployments.",
  );
}

function getToken() {
  return localStorage.getItem("fitpass_token");
}

// FIX: purchase/booking retries (double-click, a flaky connection retry)
// used to have no protection against creating a duplicate charge or a
// duplicate booking. The backend now honors an Idempotency-Key header on
// those two POSTs and replays the original response for a repeated key
// instead of re-running the handler.
function newIdempotencyKey() {
  return typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

async function request(path, options = {}) {
  const token = getToken();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  // Force drop any accidental trailing slash at the end of the full URL path string
  const finalUrl = `${API_URL}${cleanPath}`.replace(/\/$/, "");

  const res = await fetch(finalUrl, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const errorMessage =
      body.error ||
      body.message ||
      body.msg ||
      (body.messages ? JSON.stringify(body.messages) : undefined) ||
      `Request failed (${res.status})`;
    throw new Error(errorMessage);
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),

  getStudios: ({ location } = {}) =>
    request(
      `/studios${location ? `?location=${encodeURIComponent(location)}` : ""}`,
    ),
  getStudio: (studioId) => request(`/studios/${studioId}`),
  getStudioSchedule: (studioId) => request(`/studios/${studioId}/schedule`),
  createStudio: (payload) =>
    request("/studios", { method: "POST", body: JSON.stringify(payload) }),
  updateStudio: (studioId, payload) =>
    request(`/studios/${studioId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteStudio: (studioId) =>
    request(`/studios/${studioId}`, { method: "DELETE" }),

  getClasses: (params = {}) => {
    // FIX: GET /classes returned every matching row with no pagination --
    // fine at 50 rows, a slow response at 5,000. page/per_page are opt-in
    // (omit them and you get the old unpaginated behavior) so this is a
    // non-breaking change while the classes/studios list pages adopt it.
    const qs = new URLSearchParams(
      Object.fromEntries(
        Object.entries(params).filter(([, v]) => v != null && v !== ""),
      ),
    ).toString();
    // Dropped trailing slash here to match Flask blueprint context root exactly
    return request(`/classes${qs ? `?${qs}` : ""}`);
  },
  // Dropped trailing slash here
  getCategories: () => request("/classes/categories"),
  getClass: (classId) => request(`/classes/${classId}`),
  createClass: (payload) =>
    request("/classes", { method: "POST", body: JSON.stringify(payload) }),
  updateClass: (classId, payload) =>
    request(`/classes/${classId}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    }),
  deleteClass: (classId) =>
    request(`/classes/${classId}`, { method: "DELETE" }),
  getTrainers: () => request("/trainers"),

  // Dropped trailing slash here to match your blueprint structure
  getPassPlans: () => request("/passes/plans"),
  getMyPasses: () => request("/passes/my-passes"),
  purchasePass: (planKey) =>
    request("/passes/purchase", {
      method: "POST",
      headers: { "Idempotency-Key": newIdempotencyKey() },
      body: JSON.stringify({ plan_key: planKey }),
    }),

  getMyBookings: () => request("/bookings"),
  createBooking: (classId) =>
    request("/bookings", {
      method: "POST",
      headers: { "Idempotency-Key": newIdempotencyKey() },
      body: JSON.stringify({ class_id: classId }),
    }),
  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: "POST" }),

  // --- Nearby gym discovery ---
  // studios: our own bookable catalog within range.
  // discovered: unclaimed external gyms (browsable only -- see the "claim
  // this gym" CTA in the UI, not directly bookable).
  getNearbyGyms: ({ lat, lng, radiusM } = {}) =>
    request(
      `/discovery/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}${
        radiusM ? `&radius_m=${radiusM}` : ""
      }`,
    ),

  // --- Diet / nutrition tracking ---
  getNutritionProfile: () => request("/nutrition/profile"),
  updateNutritionProfile: (payload) =>
    request("/nutrition/profile", { method: "PUT", body: JSON.stringify(payload) }),
  searchFoods: (q) => request(`/nutrition/foods/search?q=${encodeURIComponent(q)}`),
  logFood: ({ foodItemId, quantityG, mealType }) =>
    request("/nutrition/logs", {
      method: "POST",
      body: JSON.stringify({ food_item_id: foodItemId, quantity_g: quantityG, meal_type: mealType }),
    }),
  getFoodLogs: (date) => request(`/nutrition/logs${date ? `?date=${date}` : ""}`),
  getNutritionSummary: (range = "week") => request(`/nutrition/summary?range=${range}`),
  getMealPlan: (meals = 3) => request(`/nutrition/plan?meals=${meals}`),
};

export default api;