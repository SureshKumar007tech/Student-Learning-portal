package com.portal.gateway.controller;

import com.portal.gateway.config.JwtValidator;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@RestController
public class GatewayRoutingController {

    @Value("${gateway.routes.user-service:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${gateway.routes.course-service:http://localhost:8082}")
    private String courseServiceUrl;

    @Value("${gateway.routes.resource-service:http://localhost:8083}")
    private String resourceServiceUrl;

    @Value("${gateway.routes.engagement-service:http://localhost:8084}")
    private String engagementServiceUrl;

    private final JwtValidator jwtValidator;
    private final HttpClient httpClient;

    public GatewayRoutingController(JwtValidator jwtValidator) {
        this.jwtValidator = jwtValidator;
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(3))
                .build();
    }

    @RequestMapping(value = {
            "/api/v1/auth/**",
            "/api/v1/users/**",
            "/api/v1/courses/**",
            "/api/v1/enrollments/**",
            "/api/v1/resources/**",
            "/api/v1/events/**",
            "/api/v1/inquiries/**"
    })
    public ResponseEntity<byte[]> proxyRequest(
            HttpServletRequest request,
            @RequestBody(required = false) byte[] body) {

        String path = request.getRequestURI();
        String query = request.getQueryString();
        String targetBaseUrl = resolveTargetService(path);

        if (targetBaseUrl == null) {
            String error = "{\"success\":false,\"message\":\"No microservice route configured for path: " + path + "\"}";
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(error.getBytes());
        }

        String targetUrl = targetBaseUrl + path + (query != null ? "?" + query : "");

        try {
            HttpRequest.Builder httpRequestBuilder = HttpRequest.newBuilder()
                    .uri(URI.create(targetUrl))
                    .timeout(Duration.ofSeconds(5));

            // Copy request headers
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String header = headerNames.nextElement();
                if (!header.equalsIgnoreCase("host") &&
                    !header.equalsIgnoreCase("content-length") &&
                    !header.equalsIgnoreCase("connection")) {
                    httpRequestBuilder.header(header, request.getHeader(header));
                }
            }

            // Extract JWT & Propagate identity headers
            String authHeader = request.getHeader("Authorization");
            if (authHeader != null && authHeader.startsWith("Bearer ")) {
                String token = authHeader.substring(7);
                if (jwtValidator.validateToken(token)) {
                    Map<String, Object> claims = jwtValidator.getClaims(token);
                    if (claims.containsKey("userId")) {
                        httpRequestBuilder.header("X-User-Id", String.valueOf(claims.get("userId")));
                    }
                    if (claims.containsKey("role")) {
                        httpRequestBuilder.header("X-User-Role", (String) claims.get("role"));
                    }
                    if (claims.containsKey("email")) {
                        httpRequestBuilder.header("X-User-Email", (String) claims.get("email"));
                    }
                }
            }

            // Set method and body
            String method = request.getMethod().toUpperCase();
            HttpRequest.BodyPublisher publisher = (body != null && body.length > 0)
                    ? HttpRequest.BodyPublishers.ofByteArray(body)
                    : HttpRequest.BodyPublishers.noBody();

            httpRequestBuilder.method(method, publisher);

            HttpResponse<byte[]> response = httpClient.send(httpRequestBuilder.build(), HttpResponse.BodyHandlers.ofByteArray());

            HttpHeaders responseHeaders = new HttpHeaders();
            response.headers().map().forEach((k, v) -> {
                if (!k.equalsIgnoreCase("content-length") && !k.equalsIgnoreCase("transfer-encoding")) {
                    responseHeaders.put(k, v);
                }
            });

            return new ResponseEntity<>(response.body(), responseHeaders, HttpStatus.valueOf(response.statusCode()));

        } catch (IOException | InterruptedException e) {
            String errorJson = String.format(
                    "{\"success\":false,\"message\":\"Target microservice at %s is unreachable or timed out\",\"path\":\"%s\"}",
                    targetBaseUrl, path
            );
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorJson.getBytes());
        }
    }

    private String resolveTargetService(String path) {
        if (path.startsWith("/api/v1/auth") || path.startsWith("/api/v1/users")) {
            return userServiceUrl;
        } else if (path.startsWith("/api/v1/courses") || path.startsWith("/api/v1/enrollments")) {
            return courseServiceUrl;
        } else if (path.startsWith("/api/v1/resources")) {
            return resourceServiceUrl;
        } else if (path.startsWith("/api/v1/events") || path.startsWith("/api/v1/inquiries")) {
            return engagementServiceUrl;
        }
        return null;
    }
}

