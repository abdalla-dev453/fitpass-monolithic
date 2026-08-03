// const API_URL = (import.meta.env.VITE_API_URL || "http://127.0.0.1:5000").replace(/\/$/, "");
const API_URL = (import.meta.env.VITE_API_URL || "https://onrender.com").replace(/\/$/, "");

function getToken() {
  return localStorage.getItem("fitpass_token");
}

async function request(path, options = {}) {
  const token = getToken();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  const res = await fetch(`${API_URL}${cleanPath}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.messages ? JSON.stringify(body.messages) : body.error || `Request failed (${res.status})`);
  }
  return res.status === 204 ? null : res.json();
}

const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),
  getMe: () => request("/auth/me"),

  getStudios: ({ location } = {}) =>
    request(`/studios/${location ? `?location=${encodeURIComponent(location)}` : ""}`),
  getStudio: (studioId) => request(`/studios/${studioId}`),
  getStudioSchedule: (studioId) => request(`/studios/${studioId}/schedule`),
  createStudio: (payload) => request("/studios/", { method: "POST", body: JSON.stringify(payload) }),
  updateStudio: (studioId, payload) => request(`/studios/${studioId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteStudio: (studioId) => request(`/studios/${studioId}`, { method: "DELETE" }),

  getClasses: (params = {}) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v != null && v !== ""))
    ).toString();
    return request(`/classes/${qs ? `?${qs}` : ""}`);
  },
  getCategories: () => request("/classes/categories"),
  getClass: (classId) => request(`/classes/${classId}`),
  createClass: (payload) =>
    request("/classes/", { method: "POST", body: JSON.stringify(payload) }),
  updateClass: (classId, payload) =>
    request(`/classes/${classId}`, { method: "PUT", body: JSON.stringify(payload) }),
  deleteClass: (classId) => request(`/classes/${classId}`, { method: "DELETE" }),
  getTrainers: () => request("/trainers/"),

  getPassPlans: () => request("/passes/plans"),
  getMyPasses: () => request("/passes/my-passes"),
  purchasePass: (planKey) =>
    request("/passes/purchase", { method: "POST", body: JSON.stringify({ plan_key: planKey }) }),

  getMyBookings: () => request("/bookings/"),
  createBooking: (classId) =>
    request("/bookings/", { method: "POST", body: JSON.stringify({ class_id: classId }) }),
  cancelBooking: (bookingId) =>
    request(`/bookings/${bookingId}/cancel`, { method: "POST" }),
};

export default api;
