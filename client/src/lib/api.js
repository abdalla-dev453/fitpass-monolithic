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
      body: JSON.stringify({ plan_key: planKey }),
    }),

  getMyBookings: () => request("/bookings"),
  createBooking: (classId) =>
    request("/bookings", {
      method: "POST",
      body: JSON.stringify({ class_id: classId }),
    }),
  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: "POST" }),
};

export default api;
