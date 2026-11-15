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
      if (response.status === 401 && token) {
        localStorage.removeItem("portal_token");
        localStorage.removeItem("portal_user");
        window.dispatchEvent(new CustomEvent("portal:auth-expired"));
      }
      const fieldErrors = data?.errors && typeof data.errors === "object" ? data.errors : null;
      let errorMessage = data?.message || friendlyStatusMessage(response.status);
      if (fieldErrors && (!data?.message || data.message === "Validation failed")) {
        errorMessage = Object.values(fieldErrors).join(" ");
      }
      return { success: false, error: errorMessage, status: response.status, fieldErrors };
    }

    return { success: true, data: data?.data !== undefined ? data.data : data };
  } catch (err) {
    // Network failure: report it honestly so the UI can show an error state
    return {
      success: false,
      error: "We couldn't reach the portal server. Check your connection and try again.",
      detail: err?.message,
      isOffline: true
    };
  }
}

function friendlyStatusMessage(status) {
  if (status === 401) return "Your session has ended. Please sign in again.";
  if (status === 403) return "You don't have permission to do that.";
  if (status === 404) return "We couldn't find what you were looking for.";
  if (status === 409) return "This has already been done.";
  if (status >= 500) return "The server ran into a problem. Please try again shortly.";
  return `Request failed (status ${status}).`;
}

/** Throws a readable Error when an API result is not successful. */
export function unwrapList(result) {
  if (result.success) {
    return Array.isArray(result.data) ? result.data : [];
  }
  const error = new Error(result.error || "Request failed");
  error.status = result.status;
  error.isOffline = Boolean(result.isOffline);
  throw error;
}

export { API_BASE_URL };
