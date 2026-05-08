// Backend base URL (no trailing slash). 
// Strips /api if it was accidentally included in the environment variable.
export const API_BASE_URL =
  import.meta.env.VITE_API_URL?.replace(/\/api\/?$/, "").replace(/\/$/, "") || "https://agri-assist-1-j9z7.onrender.com";

export const API_URL = `${API_BASE_URL}/api`;

