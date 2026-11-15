package com.portal.course.config;

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
    private final String secret = "trusted-gateway-internal-secret-32ch";

    @BeforeEach
    void setUp() {
        filter = new GatewaySecurityFilter();
        ReflectionTestUtils.setField(filter, "internalSecret", secret);
    }

    @Test
    void doFilter_WhenForgedHeadersWithoutGatewayAuth_ShouldStripXUserHeaders() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "99");
        request.addHeader("X-User-Role", "ROLE_ADMIN");
        request.addHeader("X-Custom-Header", "allowed-value");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> capturedRole = new AtomicReference<>();
        AtomicReference<String> capturedId = new AtomicReference<>();
        AtomicReference<String> capturedCustom = new AtomicReference<>();

        FilterChain filterChain = (req, res) -> {
            HttpServletRequest httpReq = (HttpServletRequest) req;
            capturedRole.set(httpReq.getHeader("X-User-Role"));
            capturedId.set(httpReq.getHeader("X-User-Id"));
            capturedCustom.set(httpReq.getHeader("X-Custom-Header"));
        };

        filter.doFilter(request, response, filterChain);

        assertThat(capturedRole.get()).isNull();
        assertThat(capturedId.get()).isNull();
        assertThat(capturedCustom.get()).isEqualTo("allowed-value");
    }

    @Test
    void doFilter_WhenValidGatewayAuthHeader_ShouldRetainXUserHeaders() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Gateway-Auth", secret);
        request.addHeader("X-User-Id", "42");
        request.addHeader("X-User-Role", "ROLE_ADMIN");
        MockHttpServletResponse response = new MockHttpServletResponse();

        AtomicReference<String> capturedRole = new AtomicReference<>();
        AtomicReference<String> capturedId = new AtomicReference<>();

        FilterChain filterChain = (req, res) -> {
            HttpServletRequest httpReq = (HttpServletRequest) req;
            capturedRole.set(httpReq.getHeader("X-User-Role"));
            capturedId.set(httpReq.getHeader("X-User-Id"));
        };

        filter.doFilter(request, response, filterChain);

        assertThat(capturedRole.get()).isEqualTo("ROLE_ADMIN");
        assertThat(capturedId.get()).isEqualTo("42");
    }
}
