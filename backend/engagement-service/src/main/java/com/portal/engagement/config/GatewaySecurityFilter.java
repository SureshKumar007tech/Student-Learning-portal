package com.portal.engagement.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletRequestWrapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.*;

/**
 * Service-to-service trust boundary filter for Engagement Service.
 * Strips untrusted caller-supplied identity headers unless validated with X-Gateway-Auth.
 */
@Component
public class GatewaySecurityFilter extends OncePerRequestFilter {

    @Value("${gateway.internal-secret:${jwt.secret:}}")
    private String internalSecret;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String incomingGatewayAuth = request.getHeader("X-Gateway-Auth");
        boolean isTrustedGateway = internalSecret != null && !internalSecret.isBlank()
                && internalSecret.equals(incomingGatewayAuth);

        if (!isTrustedGateway) {
            filterChain.doFilter(new UntrustedHeadersRequestWrapper(request), response);
            return;
        }

        filterChain.doFilter(request, response);
    }

    static class UntrustedHeadersRequestWrapper extends HttpServletRequestWrapper {
        public UntrustedHeadersRequestWrapper(HttpServletRequest request) {
            super(request);
        }

        @Override
        public String getHeader(String name) {
            if (name != null && name.toLowerCase().startsWith("x-user-")) {
                return null;
            }
            return super.getHeader(name);
        }

        @Override
        public Enumeration<String> getHeaders(String name) {
            if (name != null && name.toLowerCase().startsWith("x-user-")) {
                return Collections.emptyEnumeration();
            }
            return super.getHeaders(name);
        }

        @Override
        public Enumeration<String> getHeaderNames() {
            List<String> names = Collections.list(super.getHeaderNames());
            names.removeIf(n -> n.toLowerCase().startsWith("x-user-"));
            return Collections.enumeration(names);
        }
    }
}
