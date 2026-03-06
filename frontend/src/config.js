// Backend base URL (no trailing slash). Set VITE_API_URL in .env if backend runs on another port (e.g. 5001).
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/$/, "") || "http://localhost:5000";
export const API_URL = `${API_BASE_URL}/api`;
