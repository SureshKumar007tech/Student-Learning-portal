package com.portal.engagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;
import java.util.concurrent.atomic.AtomicReference;

import static org.assertj.core.api.Assertions.assertThat;

class GatewaySecurityFilterTest {

    private GatewaySecurityFilter filter;
    private final String secret = "test-secret-at-least-32-chars-long-engagement";

    @BeforeEach
    void setUp() {
        filter = new GatewaySecurityFilter();
        ReflectionTestUtils.setField(filter, "internalSecret", secret);
    }

    @Test
    void doFilter_WhenUntrustedDirectRequest_ShouldStripXUserHeaders() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Role", "ROLE_ADMIN");
        request.addHeader("X-User-Id", "1");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> capturedRole = new AtomicReference<>();
        FilterChain chain = (req, res) -> {
            capturedRole.set(((HttpServletRequest) req).getHeader("X-User-Role"));
        };

        filter.doFilter(request, response, chain);
        assertThat(capturedRole.get()).isNull();
    }

    @Test
    void doFilter_WhenValidGatewayAuthHeader_ShouldRetainXUserHeaders() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Gateway-Auth", secret);
        request.addHeader("X-User-Role", "ROLE_ADMIN");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> capturedRole = new AtomicReference<>();
        FilterChain chain = (req, res) -> {
            capturedRole.set(((HttpServletRequest) req).getHeader("X-User-Role"));
        };

        filter.doFilter(request, response, chain);
        assertThat(capturedRole.get()).isEqualTo("ROLE_ADMIN");
    }
}
