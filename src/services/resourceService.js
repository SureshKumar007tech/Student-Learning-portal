import { apiRequest } from "./apiClient";

export const FALLBACK_RESOURCES = [
  {
    id: 1,
    title: "Web Engineering Lecture Notes & Slides",
    description: "Complete lecture notes covering HTML5 semantics, modern CSS styling, React component models, and DOM lifecycle.",
    resourceType: "NOTES",
    fileUrl: "/files/notes-web-engineering.pdf",
    fileSize: "4.2 MB",
    fileFormat: "PDF",
    downloadCount: 142
  },
  {
    id: 2,
    title: "Interactive Coding Exercises & Solutions",
    description: "Curated practice problem sets, component challenges, and state synchronization exercises with test specs.",
    resourceType: "EXERCISES",
    fileUrl: "/files/exercises-practice-pack.zip",
    fileSize: "12.8 MB",
    fileFormat: "ZIP",
    downloadCount: 98
  },
  {
    id: 3,
    title: "Production Starter Projects & Boilerplates",
    description: "Production-ready starter templates including React 19 SPA, Vite config, Spring Boot microservices, and Docker Compose.",
    resourceType: "PROJECTS",
    fileUrl: "/files/starter-projects-bundle.zip",
    fileSize: "18.5 MB",
    fileFormat: "ZIP",
    downloadCount: 175
  },
  {
    id: 4,
    title: "Microservices & Distributed Systems Cheat Sheet",
    description: "High-density reference guide: REST best practices, JWT stateless auth, API Gateway reverse proxying, and Database-per-service.",
    resourceType: "CHEATSHEET",
    fileUrl: "/files/microservices-architecture-cheatsheet.pdf",
    fileSize: "2.1 MB",
    fileFormat: "PDF",
    downloadCount: 230
  }
];

export async function fetchResources(type) {
  const query = (type && type !== "All") ? `?type=${encodeURIComponent(type)}` : "";
  const result = await apiRequest(`/resources${query}`);

  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    return result.data;
  }

  if (type && type !== "All") {
    return FALLBACK_RESOURCES.filter(r => r.resourceType.toUpperCase() === type.toUpperCase());
  }
  return FALLBACK_RESOURCES;
}

export async function fetchResourceById(id) {
  const result = await apiRequest(`/resources/${id}`);
  if (result.success && result.data) return result.data;
  return FALLBACK_RESOURCES.find(r => r.id === Number(id)) || null;
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
