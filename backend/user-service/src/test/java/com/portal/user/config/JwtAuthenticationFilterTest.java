package com.portal.user.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.test.util.ReflectionTestUtils;

import java.io.IOException;

import static org.assertj.core.api.Assertions.assertThat;

class JwtAuthenticationFilterTest {

    private JwtTokenProvider jwtTokenProvider;
    private JwtAuthenticationFilter filter;
    private final String secret = "test-secret-at-least-32-chars-long-for-jwt-signing";

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        jwtTokenProvider = new JwtTokenProvider();
        ReflectionTestUtils.setField(jwtTokenProvider, "secret", secret);
        ReflectionTestUtils.setField(jwtTokenProvider, "expirationMs", 3600000L);
        jwtTokenProvider.validateSecretConfiguration();

        filter = new JwtAuthenticationFilter(jwtTokenProvider);
        ReflectionTestUtils.setField(filter, "gatewayInternalSecret", secret);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void doFilter_WhenForgedGatewayHeadersWithoutGatewayAuth_ShouldIgnoreHeadersAndRemainUnauthenticated() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-User-Id", "1");
        request.addHeader("X-User-Role", "ROLE_ADMIN");
        request.addHeader("X-User-Email", "admin@evil.com");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
    }

    @Test
    void doFilter_WhenForgedGatewayAuthSecret_ShouldIgnoreHeadersAndRemainUnauthenticated() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Gateway-Auth", "wrong-or-forged-gateway-secret");
        request.addHeader("X-User-Id", "1");
        request.addHeader("X-User-Role", "ROLE_ADMIN");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
    }

    @Test
    void doFilter_WhenValidGatewayAuthHeader_ShouldAuthenticateWithRoleAndDetails() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("X-Gateway-Auth", secret);
        request.addHeader("X-User-Id", "5");
        request.addHeader("X-User-Name", "john_doe");
        request.addHeader("X-User-Role", "ROLE_STUDENT");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getName()).isEqualTo("john_doe");
        assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_STUDENT"));
        assertThat(auth.getDetails()).isInstanceOf(UserAuthDetails.class);
        UserAuthDetails details = (UserAuthDetails) auth.getDetails();
        assertThat(details.userId()).isEqualTo(5L);
        assertThat(details.role()).isEqualTo("ROLE_STUDENT");
    }

    @Test
    void doFilter_WhenValidBearerToken_ShouldAuthenticateWithTokenClaims() throws ServletException, IOException {
        String token = jwtTokenProvider.generateToken(12L, "alice", "alice@example.com", "ROLE_INSTRUCTOR");
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.getName()).isEqualTo("alice");
        assertThat(auth.getAuthorities()).anyMatch(a -> a.getAuthority().equals("ROLE_INSTRUCTOR"));
        assertThat(auth.getDetails()).isInstanceOf(UserAuthDetails.class);
        UserAuthDetails details = (UserAuthDetails) auth.getDetails();
        assertThat(details.userId()).isEqualTo(12L);
    }

    @Test
    void doFilter_WhenInvalidBearerToken_ShouldRemainUnauthenticated() throws ServletException, IOException {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid.jwt.signature");
        MockHttpServletResponse response = new MockHttpServletResponse();
        FilterChain filterChain = (req, res) -> {};

        filter.doFilter(request, response, filterChain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
    }
}
