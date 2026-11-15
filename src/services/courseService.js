import { apiRequest, unwrapList } from "./apiClient";

export async function fetchCourses(level) {
  const query = (level && level !== "All") ? `?level=${encodeURIComponent(level)}` : "";
  return unwrapList(await apiRequest(`/courses${query}`));
}

export async function fetchCourseById(id) {
  const result = await apiRequest(`/courses/${id}`);
  return result.success ? result.data : null;
}

export async function createCourse(courseData) {
  return await apiRequest("/courses", {
    method: "POST",
    body: JSON.stringify(courseData)
  });
}

export async function enrollInCourse(courseId, studentId) {
  return await apiRequest("/enrollments", {
    method: "POST",
    body: JSON.stringify({ courseId, studentId })
  });
}

export async function fetchStudentEnrollments(studentId) {
  if (!studentId) {
    return fetchMyEnrollments();
  }
  return unwrapList(await apiRequest(`/enrollments/student/${studentId}`));
}

export async function fetchMyEnrollments() {
  return unwrapList(await apiRequest("/enrollments/my"));
}

export async function updateCourseProgress(enrollmentId, progressPercent) {
  return await apiRequest(`/enrollments/${enrollmentId}/progress`, {
    method: "PUT",
    body: JSON.stringify({ progressPercent })
  });
}
