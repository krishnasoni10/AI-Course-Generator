const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const apiFetch = async (endpoint, options = {}) => {
  if (!BASE_URL) {
    throw new Error("Missing VITE_API_BASE_URL. Please configure frontend environment variables.");
  }

  const token = localStorage.getItem("token");

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  if (!res.ok) {
    let message = "API Error";
    try {
      const data = await res.json();
      message = data.error
        ? `${data.message || "API Error"} (${data.error})`
        : data.message || JSON.stringify(data);
    } catch {
      message = await res.text();
    }
    throw new Error(message || "API Error");
  }

  return res.json();
};
