package com.portal.gateway.controller;

import com.portal.gateway.config.JwtValidator;
import jakarta.servlet.http.HttpServletRequest;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.slf4j.MDC;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.*;

@RestController
public class GatewayRoutingController {

    private static final Logger log = LoggerFactory.getLogger(GatewayRoutingController.class);

    @Value("${gateway.routes.user-service:http://localhost:8081}")
    private String userServiceUrl;

    @Value("${gateway.routes.course-service:http://localhost:8082}")
    private String courseServiceUrl;

    @Value("${gateway.routes.resource-service:http://localhost:8083}")
    private String resourceServiceUrl;

    @Value("${gateway.routes.engagement-service:http://localhost:8084}")
    private String engagementServiceUrl;

    @Value("${gateway.internal-secret:${jwt.secret}}")
    private String internalSecret;

    private final JwtValidator jwtValidator;
    private HttpClient httpClient;


    @Autowired
    public GatewayRoutingController(JwtValidator jwtValidator) {
        this(jwtValidator, null);
    }

    public GatewayRoutingController(JwtValidator jwtValidator, HttpClient httpClient) {
        this.jwtValidator = jwtValidator;
        this.httpClient = httpClient;
    }

    private synchronized HttpClient getHttpClient() {
        if (this.httpClient == null) {
            this.httpClient = HttpClient.newBuilder()
                    .connectTimeout(Duration.ofSeconds(4))
                    .build();
        }
        return this.httpClient;
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

        // Correlation ID tracking
        String correlationId = request.getHeader("X-Correlation-Id");
        if (correlationId == null || correlationId.trim().isEmpty()) {
            correlationId = UUID.randomUUID().toString();
        }
        MDC.put("correlationId", correlationId);

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
                    .timeout(Duration.ofSeconds(6));

            // Copy request headers, STRICTLY DROPPING any untrusted caller-supplied X-User-* headers
            Enumeration<String> headerNames = request.getHeaderNames();
            while (headerNames.hasMoreElements()) {
                String header = headerNames.nextElement();
                String lowerHeader = header.toLowerCase();

                // Drop forbidden or caller-spoofed headers
                if (lowerHeader.startsWith("x-user-") ||
                    lowerHeader.equalsIgnoreCase("x-gateway-auth") ||
                    lowerHeader.equalsIgnoreCase("host") ||
                    lowerHeader.equalsIgnoreCase("content-length") ||
                    lowerHeader.equalsIgnoreCase("connection")) {
                    continue;
                }
                httpRequestBuilder.header(header, request.getHeader(header));
            }

            // Propagate correlation ID to downstream services
            httpRequestBuilder.header("X-Correlation-Id", correlationId);

            // Forward internal service trust token so downstream services recognize trusted gateway traffic
            if (internalSecret != null && !internalSecret.isBlank()) {
                httpRequestBuilder.header("X-Gateway-Auth", internalSecret);
            }

            // Extract JWT & Propagate verified identity headers ONLY after valid signature & expiration check
            String authHeader = request.getHeader("Authorization");
            boolean hasBearer = authHeader != null && authHeader.startsWith("Bearer ");
            boolean tokenValid = false;

            if (hasBearer) {
                String token = authHeader.substring(7);
                if (jwtValidator.validateToken(token)) {
                    tokenValid = true;
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
                    if (claims.containsKey("sub")) {
                        httpRequestBuilder.header("X-User-Name", (String) claims.get("sub"));
                    }
                } else {
                    log.warn("Invalid or expired JWT token attempted for path: {}", path);
                    // If an invalid token was supplied, reject immediately with 401
                    String error = "{\"success\":false,\"message\":\"Invalid or expired authentication token\",\"path\":\"" + path + "\"}";
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(error.getBytes());
                }
            }

            // Enforce that sensitive endpoints require authentication at gateway
            if (isProtectedEndpoint(path, request.getMethod()) && !tokenValid) {
                log.warn("Unauthorized access attempt to protected endpoint: {} {}", request.getMethod(), path);
                String error = "{\"success\":false,\"message\":\"Authentication required to access this resource\",\"path\":\"" + path + "\"}";
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .contentType(MediaType.APPLICATION_JSON)
                        .body(error.getBytes());
            }

            // Set method and body
            String method = request.getMethod().toUpperCase();
            HttpRequest.BodyPublisher publisher = (body != null && body.length > 0)
                    ? HttpRequest.BodyPublishers.ofByteArray(body)
                    : HttpRequest.BodyPublishers.noBody();

            httpRequestBuilder.method(method, publisher);

            HttpResponse<byte[]> response = getHttpClient().send(httpRequestBuilder.build(), HttpResponse.BodyHandlers.ofByteArray());

            HttpHeaders responseHeaders = new HttpHeaders();
            response.headers().map().forEach((k, v) -> {
                if (!k.equalsIgnoreCase("content-length") && !k.equalsIgnoreCase("transfer-encoding")) {
                    responseHeaders.put(k, v);
                }
            });
            responseHeaders.set("X-Correlation-Id", correlationId);

            return new ResponseEntity<>(response.body(), responseHeaders, HttpStatus.valueOf(response.statusCode()));

        } catch (IOException | InterruptedException e) {
            log.error("Downstream microservice at {} unreachable or timed out: {}", targetBaseUrl, e.getMessage());
            String errorJson = String.format(
                    "{\"success\":false,\"message\":\"Target microservice at %s is unreachable or timed out\",\"path\":\"%s\"}",
                    targetBaseUrl, path
            );
            return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(errorJson.getBytes());
        } finally {
            MDC.remove("correlationId");
        }
    }

    private boolean isProtectedEndpoint(String path, String method) {
        // Endpoints that strictly require authentication
        if (path.startsWith("/api/v1/auth/me")) return true;
        if (path.startsWith("/api/v1/enrollments")) return true;
        if (path.startsWith("/api/v1/users/profile") && !path.endsWith("/visit")) return true;
        if (path.equals("/api/v1/users") && method.equalsIgnoreCase("GET")) return true;
        if (path.startsWith("/api/v1/events/") && path.endsWith("/register")) return true;
        if (path.startsWith("/api/v1/inquiries") && !method.equalsIgnoreCase("POST")) return true;
        return false;
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
