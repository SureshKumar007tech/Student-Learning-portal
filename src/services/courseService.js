import { apiRequest } from "./apiClient";

export const FALLBACK_COURSES = [
  {
    id: 1,
    code: "CS-HTML",
    title: "HTML5 Modern Semantic Web",
    description: "Master modern document architecture, accessibility (WCAG), and responsive semantic web structures.",
    level: "Beginner",
    durationHours: 8,
    instructor: "Dr. Elena Rostova",
    category: "Frontend Development",
    rating: 4.8,
    enrolledCount: 142
  },
  {
    id: 2,
    code: "CS-CSS",
    title: "CSS3 Flexbox & Grid Systems",
    description: "Build robust, responsive enterprise UI layouts with modern CSS Grid, Flexbox, variables, and animations.",
    level: "Beginner",
    durationHours: 12,
    instructor: "Marcus Vance",
    category: "UI/UX Engineering",
    rating: 4.9,
    enrolledCount: 198
  },
  {
    id: 3,
    code: "CS-REACT",
    title: "React 19 Architecture & Hooks",
    description: "Learn component lifecycle, custom hooks, context state management, and modern SPA architecture.",
    level: "Intermediate",
    durationHours: 20,
    instructor: "Sarah Jenkins",
    category: "Frontend Frameworks",
    rating: 4.95,
    enrolledCount: 312
  },
  {
    id: 4,
    code: "CS-MICROSERVICES",
    title: "Spring Boot Microservices & Gateway",
    description: "Build scalable distributed architectures with Spring JDBC, API Gateway routing, JWT validation, and PostgreSQL.",
    level: "Advanced",
    durationHours: 30,
    instructor: "Prof. David K.",
    category: "Distributed Systems",
    rating: 4.92,
    enrolledCount: 220
  }
];

export async function fetchCourses(level) {
  const query = (level && level !== "All") ? `?level=${encodeURIComponent(level)}` : "";
  const result = await apiRequest(`/courses${query}`);

  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    return result.data;
  }

  // Graceful fallback
  if (level && level !== "All") {
    return FALLBACK_COURSES.filter(c => c.level.toLowerCase() === level.toLowerCase());
  }
  return FALLBACK_COURSES;
}

export async function fetchCourseById(id) {
  const result = await apiRequest(`/courses/${id}`);
  if (result.success && result.data) return result.data;
  return FALLBACK_COURSES.find(c => c.id === Number(id)) || null;
}

export async function createCourse(courseData) {
  return await apiRequest("/courses", {
    method: "POST",
    body: JSON.stringify(courseData)
  });
}

export async function enrollInCourse(courseId, studentId = 1) {
  return await apiRequest("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId, studentId })
  });
}

export async function fetchStudentEnrollments(studentId = 1) {
  const result = await apiRequest(`/enrollments/student/${studentId}`);
  if (result.success && Array.isArray(result.data)) {
    return result.data;
  }
  return [];
}

export async function updateCourseProgress(enrollmentId, progressPercent) {
  return await apiRequest(`/enrollments/${enrollmentId}/progress`, {
    method: "PUT",
    body: JSON.stringify({ progressPercent })
  });
}
