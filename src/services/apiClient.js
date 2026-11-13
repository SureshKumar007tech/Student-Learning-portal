// Centralized API client targeting API Gateway at http://localhost:8080/api/v1
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api/v1";

export async function apiRequest(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem("portal_token");

  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMessage = data?.message || `Request failed with status ${response.status}`;
      return { success: false, error: errorMessage, status: response.status };
    }

    return { success: true, data: data?.data !== undefined ? data.data : data };
  } catch (err) {
    // Graceful offline fallback
    return {
      success: false,
      error: err.message || "Network error. Backend microservices might be offline.",
      isOffline: true
    };
  }
}

export { API_BASE_URL };
