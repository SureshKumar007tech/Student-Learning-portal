import { apiRequest, unwrapList } from "./apiClient";

export async function fetchResources(type) {
  const query = (type && type !== "All") ? `?type=${encodeURIComponent(type)}` : "";
  return unwrapList(await apiRequest(`/resources${query}`));
}

export async function fetchResourceById(id) {
  const result = await apiRequest(`/resources/${id}`);
  return result.success ? result.data : null;
}

export async function createResource(resourceData) {
  return await apiRequest("/resources", {
    method: "POST",
    body: JSON.stringify(resourceData)
  });
}

export async function downloadResource(id) {
  return await apiRequest(`/resources/${id}/download`, {
    method: "POST"
  });
}
