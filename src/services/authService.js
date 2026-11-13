import { apiRequest } from "./apiClient";

export async function loginUser(usernameOrEmail, password) {
  const result = await apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify({ usernameOrEmail, password })
  });

  if (result.success && result.data?.token) {
    localStorage.setItem("portal_token", result.data.token);
    localStorage.setItem("portal_user", JSON.stringify(result.data));
  }
  return result;
}

export async function registerUser(userData) {
  const result = await apiRequest("/auth/register", {
    method: "POST",
    body: JSON.stringify(userData)
  });

  if (result.success && result.data?.token) {
    localStorage.setItem("portal_token", result.data.token);
    localStorage.setItem("portal_user", JSON.stringify(result.data));
  }
  return result;
}

export async function getCurrentUser() {
  return await apiRequest("/auth/me");
}

export function logoutUser() {
  localStorage.removeItem("portal_token");
  localStorage.removeItem("portal_user");
}

export async function getStudentProfile(studentName, userId) {
  let query = "";
  if (studentName) {
    query = `?studentName=${encodeURIComponent(studentName)}`;
  } else if (userId) {
    query = `?userId=${userId}`;
  }
  return await apiRequest(`/users/profile${query}`);
}

export async function updateStudentProfile(profileData, userId) {
  const query = userId ? `?userId=${userId}` : "";
  return await apiRequest(`/users/profile${query}`, {
    method: "PUT",
    body: JSON.stringify(profileData)
  });
}

export async function recordVisit(userId = 1) {
  return await apiRequest(`/users/profile/visit?userId=${userId}`, {
    method: "POST"
  });
}

export async function getAllUsers() {
  return await apiRequest("/users");
}

export async function checkGatewayHealth() {
  return await apiRequest("/gateway/health");
}

export async function getGatewayStatus() {
  return await apiRequest("/gateway/status");
}
