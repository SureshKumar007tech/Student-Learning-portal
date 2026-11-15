package com.portal.gateway.controller;

import com.portal.gateway.config.JwtValidator;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.test.util.ReflectionTestUtils;

import static org.assertj.core.api.Assertions.assertThat;

class GatewayRoutingSecurityTest {

    private JwtValidator jwtValidator;
    private GatewayRoutingController gatewayController;
    private final String secret = "test-secret-at-least-32-chars-long-api-gateway";

    @BeforeEach
    void setUp() {
        jwtValidator = new JwtValidator();
        ReflectionTestUtils.setField(jwtValidator, "secret", secret);
        jwtValidator.validateSecretConfiguration();

        gatewayController = new GatewayRoutingController(jwtValidator);
        ReflectionTestUtils.setField(gatewayController, "userServiceUrl", "http://localhost:8081");
        ReflectionTestUtils.setField(gatewayController, "courseServiceUrl", "http://localhost:8082");
        ReflectionTestUtils.setField(gatewayController, "resourceServiceUrl", "http://localhost:8083");
        ReflectionTestUtils.setField(gatewayController, "engagementServiceUrl", "http://localhost:8084");
        ReflectionTestUtils.setField(gatewayController, "internalSecret", secret);
    }

    @Test
    void proxyRequest_WhenProtectedEnrollmentsEndpointWithoutToken_ShouldReturn401Unauthorized() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/enrollments/my");
        request.addHeader("X-User-Role", "ROLE_ADMIN"); // Forged header

        ResponseEntity<byte[]> response = gatewayController.proxyRequest(request, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        String body = new String(response.getBody());
        assertThat(body).contains("Authentication required");
    }

    @Test
    void proxyRequest_WhenInvalidTokenProvided_ShouldReturn401Unauthorized() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/enrollments/my");
        request.addHeader("Authorization", "Bearer invalid.expired.token");

        ResponseEntity<byte[]> response = gatewayController.proxyRequest(request, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        String body = new String(response.getBody());
        assertThat(body).contains("Invalid or expired authentication token");
    }

    @Test
    void proxyRequest_WhenProtectedProfileEndpointWithoutToken_ShouldReturn401Unauthorized() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/users/profile");

        ResponseEntity<byte[]> response = gatewayController.proxyRequest(request, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.UNAUTHORIZED);
        String body = new String(response.getBody());
        assertThat(body).contains("Authentication required");
    }

    @Test
    void proxyRequest_WhenUnmappedRouteRequested_ShouldReturn404NotFound() {
        MockHttpServletRequest request = new MockHttpServletRequest("GET", "/api/v1/unknown/endpoint");

        ResponseEntity<byte[]> response = gatewayController.proxyRequest(request, null);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.NOT_FOUND);
    }
}
