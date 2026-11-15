import { apiRequest, unwrapList } from "./apiClient";

export async function fetchEvents() {
  return unwrapList(await apiRequest("/events"));
}

export async function fetchEventById(id) {
  const result = await apiRequest(`/events/${id}`);
  return result.success ? result.data : null;
}

export async function createEvent(eventData) {
  return await apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventData)
  });
}

export async function registerForEvent(eventId, studentId, studentName, studentEmail) {
  return await apiRequest(`/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify({ eventId, studentId, studentName, studentEmail })
  });
}

export async function cancelEventRegistration(eventId) {
  return await apiRequest(`/events/${eventId}/register`, {
    method: "DELETE"
  });
}

export async function fetchMyEventRegistrations() {
  return unwrapList(await apiRequest("/events/registrations/my"));
}
