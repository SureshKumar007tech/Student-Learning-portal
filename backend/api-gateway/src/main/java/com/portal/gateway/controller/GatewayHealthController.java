package com.portal.gateway.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/gateway")
public class GatewayHealthController {

    @Value("${gateway.routes.user-service:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${gateway.routes.course-service:http://localhost:8082}")
    private String courseServiceUrl;

    @Value("${gateway.routes.resource-service:http://localhost:8083}")
    private String resourceServiceUrl;

    @Value("${gateway.routes.engagement-service:http://localhost:8084}")
    private String engagementServiceUrl;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(1))
            .build();

    @GetMapping("/status")
    public ResponseEntity<Map<String, Object>> getStatus() {
        Map<String, Object> status = new HashMap<>();
        status.put("gateway", "UP");
        status.put("timestamp", LocalDateTime.now().toString());

        Map<String, String> routes = new HashMap<>();
        routes.put("/api/v1/auth/**, /api/v1/users/**", userServiceUrl);
        routes.put("/api/v1/courses/**, /api/v1/enrollments/**", courseServiceUrl);
        routes.put("/api/v1/resources/**", resourceServiceUrl);
        routes.put("/api/v1/events/**, /api/v1/inquiries/**", engagementServiceUrl);
        status.put("routes", routes);

        return ResponseEntity.ok(status);
    }

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        Map<String, Object> health = new HashMap<>();
        health.put("gateway", "UP");
        health.put("user-service", pingService(userServiceUrl + "/api/v1/auth/me"));
        health.put("course-service", pingService(courseServiceUrl + "/api/v1/courses"));
        health.put("resource-service", pingService(resourceServiceUrl + "/api/v1/resources"));
        health.put("engagement-service", pingService(engagementServiceUrl + "/api/v1/events"));
        health.put("timestamp", LocalDateTime.now().toString());
        return ResponseEntity.ok(health);
    }

    private String pingService(String url) {
        try {
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(1))
                    .GET()
                    .build();
            HttpResponse<Void> resp = httpClient.send(request, HttpResponse.BodyHandlers.discarding());
            return (resp.statusCode() < 500) ? "UP" : "DOWN";
        } catch (Exception e) {
            return "DOWN (" + e.getClass().getSimpleName() + ")";
        }
    }
}

