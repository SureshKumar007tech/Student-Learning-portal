package com.portal.gateway.controller;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class OpenApiController {

    @GetMapping(value = "/v3/api-docs", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Map<String, Object>> getOpenApiDocs() {
        Map<String, Object> doc = new HashMap<>();
        doc.put("openapi", "3.0.3");

        Map<String, Object> info = new HashMap<>();
        info.put("title", "Student Learning Management Portal API");
        info.put("description", "Enterprise-grade REST API for Student Learning Portal with Microservices Architecture (API Gateway, User Service, Course Service, Resource Service, Engagement Service)");
        info.put("version", "1.0.0");
        doc.put("info", info);

        doc.put("servers", List.of(
                Map.of("url", "http://localhost:8080", "description", "API Gateway (Unified Edge)")
        ));

        Map<String, Object> components = new HashMap<>();
        Map<String, Object> securitySchemes = new HashMap<>();
        securitySchemes.put("bearerAuth", Map.of(
                "type", "http",
                "scheme", "bearer",
                "bearerFormat", "JWT",
                "description", "JWT Bearer authentication token issued upon login or registration"
        ));
        components.put("securitySchemes", securitySchemes);
        doc.put("components", components);

        Map<String, Object> paths = new HashMap<>();

        // Auth endpoints
        paths.put("/api/v1/auth/register", Map.of(
                "post", Map.of(
                        "tags", List.of("Authentication"),
                        "summary", "Public student self-registration (unconditionally assigns ROLE_STUDENT)",
                        "responses", Map.of("201", Map.of("description", "Student account registered successfully"),
                                            "409", Map.of("description", "Username or email already exists"))
                )
        ));
        paths.put("/api/v1/auth/login", Map.of(
                "post", Map.of(
                        "tags", List.of("Authentication"),
                        "summary", "Authenticate credentials and obtain JWT token",
                        "responses", Map.of("200", Map.of("description", "Authentication successful with JWT token"),
                                            "401", Map.of("description", "Invalid username or password"))
                )
        ));
        paths.put("/api/v1/auth/me", Map.of(
                "get", Map.of(
                        "tags", List.of("Authentication"),
                        "summary", "Get verified current user identity and authorities",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("200", Map.of("description", "Authenticated user identity claims"),
                                            "401", Map.of("description", "Unauthorized or expired token"))
                )
        ));

        // Course endpoints
        paths.put("/api/v1/courses", Map.of(
                "get", Map.of(
                        "tags", List.of("Courses"),
                        "summary", "List all active courses with optional level filter (All, Beginner, Intermediate, Advanced)",
                        "responses", Map.of("200", Map.of("description", "Course catalog retrieved"))
                ),
                "post", Map.of(
                        "tags", List.of("Courses"),
                        "summary", "Create new course (Admin and Instructor only)",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("201", Map.of("description", "Course created"),
                                            "403", Map.of("description", "Forbidden for non-admin/instructor"))
                )
        ));
        paths.put("/api/v1/courses/{id}", Map.of(
                "get", Map.of(
                        "tags", List.of("Courses"),
                        "summary", "Get course details by ID",
                        "responses", Map.of("200", Map.of("description", "Course details"),
                                            "404", Map.of("description", "Course not found"))
                )
        ));

        // Enrollment endpoints
        paths.put("/api/v1/enrollments", Map.of(
                "post", Map.of(
                        "tags", List.of("Enrollments"),
                        "summary", "Enroll authenticated student in a course (derives studentId from verified JWT context)",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("201", Map.of("description", "Enrolled successfully"),
                                            "409", Map.of("description", "Student is already enrolled in this course"))
                )
        ));
        paths.put("/api/v1/enrollments/my", Map.of(
                "get", Map.of(
                        "tags", List.of("Enrollments"),
                        "summary", "Get enrollments and progress for authenticated student",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("200", Map.of("description", "Active student enrollments list"))
                )
        ));
        paths.put("/api/v1/enrollments/{id}/progress", Map.of(
                "put", Map.of(
                        "tags", List.of("Enrollments"),
                        "summary", "Update progress percent (0-100) for student's enrollment",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("200", Map.of("description", "Progress updated"),
                                            "403", Map.of("description", "Access denied: Cannot update other student's enrollment"))
                )
        ));

        // Resource endpoints
        paths.put("/api/v1/resources", Map.of(
                "get", Map.of(
                        "tags", List.of("Resources"),
                        "summary", "List all learning resources with optional category filter",
                        "responses", Map.of("200", Map.of("description", "Learning resources retrieved"))
                ),
                "post", Map.of(
                        "tags", List.of("Resources"),
                        "summary", "Create new learning resource (Admin and Instructor only)",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("201", Map.of("description", "Resource created"),
                                            "403", Map.of("description", "Forbidden for non-admin/instructor"))
                )
        ));
        paths.put("/api/v1/resources/{id}/download", Map.of(
                "post", Map.of(
                        "tags", List.of("Resources"),
                        "summary", "Increment download counter and retrieve resource download descriptor",
                        "responses", Map.of("200", Map.of("description", "Download metadata returned with updated count"))
                )
        ));

        // Event endpoints
        paths.put("/api/v1/events", Map.of(
                "get", Map.of(
                        "tags", List.of("Events"),
                        "summary", "List all academic events with real-time capacity and registration count",
                        "responses", Map.of("200", Map.of("description", "Events catalog retrieved"))
                ),
                "post", Map.of(
                        "tags", List.of("Events"),
                        "summary", "Create new academic event (Admin only)",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("201", Map.of("description", "Event created"),
                                            "403", Map.of("description", "Forbidden for non-admin"))
                )
        ));
        paths.put("/api/v1/events/{id}/register", Map.of(
                "post", Map.of(
                        "tags", List.of("Events"),
                        "summary", "Register authenticated student for event with capacity enforcement and duplicate prevention",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("200", Map.of("description", "Registered successfully"),
                                            "400", Map.of("description", "Event has reached maximum capacity"),
                                            "409", Map.of("description", "Already registered for this event"))
                ),
                "delete", Map.of(
                        "tags", List.of("Events"),
                        "summary", "Cancel registration for event",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("200", Map.of("description", "Registration cancelled successfully"),
                                            "404", Map.of("description", "No active registration found"))
                )
        ));
        paths.put("/api/v1/events/registrations/my", Map.of(
                "get", Map.of(
                        "tags", List.of("Events"),
                        "summary", "Get current student's registered events",
                        "security", List.of(Map.of("bearerAuth", List.of())),
                        "responses", Map.of("200", Map.of("description", "List of student registrations"))
                )
        ));

        // Gateway health
        paths.put("/api/v1/gateway/health", Map.of(
                "get", Map.of(
                        "tags", List.of("System"),
                        "summary", "Cluster readiness & downstream microservices health check",
                        "responses", Map.of("200", Map.of("description", "Health status of API Gateway and all microservices"))
                )
        ));

        doc.put("paths", paths);
        return ResponseEntity.ok(doc);
    }
}
