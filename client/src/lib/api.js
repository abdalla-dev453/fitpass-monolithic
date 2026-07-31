const API_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:5000";

function getToken() {
  return localStorage.getItem("fitpass_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  // auth
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),

  // studios
  getStudios: ({ location } = {}) =>
    request(`/studios/${location ? `?location=${encodeURIComponent(location)}` : ""}`),
  getStudio: (studioId) => request(`/studios/${studioId}`),
  getStudioSchedule: (studioId) => request(`/studios/${studioId}/schedule`),

  // classes
  getClasses: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    return request(`/classes/${qs ? `?${qs}` : ""}`);
  },
  getCategories: () => request("/classes/categories"),
  getClass: (classId) => request(`/classes/${classId}`),

   // passes
  getPassPlans: () => request("/passes/plans"),
  getMyPasses: () => request("/passes/my-passes"), // Fixed: removed trailing slash
  purchasePass: (planKey) =>
    request("/passes/purchase", { method: "POST", body: JSON.stringify({ plan_key: planKey }) }),

  // bookings
  getMyBookings: () => request("/bookings"), // Fixed: removed trailing slash
  createBooking: (classId) =>
    request("/bookings", { method: "POST", body: JSON.stringify({ class_id: classId }) }),
  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: "POST" }),
};

export default api;

