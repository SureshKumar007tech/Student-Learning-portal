import { apiRequest } from "./apiClient";

export const FALLBACK_EVENTS = [
  {
    id: 1,
    title: "Full-Stack Web Development Workshop",
    eventDate: "20 October 2026",
    time: "10:00 AM - 1:00 PM",
    venue: "Seminar Hall A / Hybrid Stream",
    organizer: "Department of Computer Science",
    description: "Hands-on engineering workshop covering modern React 19 frontend integration with Spring Boot REST microservices.",
    capacity: 120,
    registeredCount: 84,
    category: "Workshop"
  },
  {
    id: 2,
    title: "Capstone Project Showcase & Review",
    eventDate: "30 October 2026",
    time: "2:00 PM - 5:00 PM",
    venue: "Main Computing Complex - Lab 4",
    organizer: "Web Dev & Software Society",
    description: "Final-year students present enterprise applications to industry panels and academic mentors for technical evaluation.",
    capacity: 80,
    registeredCount: 72,
    category: "Showcase"
  },
  {
    id: 3,
    title: "Competitive Algorithmic Coding Sprint",
    eventDate: "5 November 2026",
    time: "9:00 AM - 12:00 PM",
    venue: "Innovation Tech Hub",
    organizer: "ACM Student Chapter",
    description: "Time-pressured algorithmic problem solving, optimized data structure utilization, and live code evaluations.",
    capacity: 60,
    registeredCount: 58,
    category: "Competition"
  },
  {
    id: 4,
    title: "Microservices & Cloud Architecture Hackathon",
    eventDate: "15 November 2026",
    time: "9:00 AM - 6:00 PM",
    venue: "University Grand Auditorium",
    organizer: "Faculty of Engineering",
    description: "36-hour distributed systems challenge: build fault-tolerant microservices with API Gateway, JWT security, and Docker containers.",
    capacity: 200,
    registeredCount: 165,
    category: "Hackathon"
  }
];

export async function fetchEvents() {
  const result = await apiRequest("/events");
  if (result.success && Array.isArray(result.data) && result.data.length > 0) {
    return result.data;
  }
  return FALLBACK_EVENTS;
}

export async function fetchEventById(id) {
  const result = await apiRequest(`/events/${id}`);
  if (result.success && result.data) return result.data;
  return FALLBACK_EVENTS.find(e => e.id === Number(id)) || null;
}

export async function createEvent(eventData) {
  return await apiRequest("/events", {
    method: "POST",
    body: JSON.stringify(eventData)
  });
}

export async function registerForEvent(eventId, studentId = 1, studentName = "Student", studentEmail = "student@portal.edu") {
  return await apiRequest(`/events/${eventId}/register`, {
    method: "POST",
    body: JSON.stringify({ eventId, studentId, studentName, studentEmail })
  });
}
