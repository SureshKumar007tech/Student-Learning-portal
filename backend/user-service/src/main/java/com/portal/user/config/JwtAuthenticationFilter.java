package com.portal.user.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Collections;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider jwtTokenProvider;

    public JwtAuthenticationFilter(JwtTokenProvider jwtTokenProvider) {
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String token = resolveToken(request);
        if (token != null && jwtTokenProvider.validateToken(token)) {
            String username = jwtTokenProvider.getUsernameFromToken(token);
            String role = jwtTokenProvider.getRoleFromToken(token);

            SimpleGrantedAuthority authority = new SimpleGrantedAuthority(role != null ? role : "ROLE_STUDENT");
            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                    username, null, Collections.singletonList(authority));
            SecurityContextHolder.getContext().setAuthentication(auth);
        } else {
            // Check headers propagated from API Gateway
            String gatewayUserId = request.getHeader("X-User-Id");
            String gatewayRole = request.getHeader("X-User-Role");
            String gatewayEmail = request.getHeader("X-User-Email");

            if (gatewayUserId != null && gatewayRole != null) {
                SimpleGrantedAuthority authority = new SimpleGrantedAuthority(gatewayRole);
                UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                        gatewayEmail != null ? gatewayEmail : gatewayUserId, null, Collections.singletonList(authority));
                SecurityContextHolder.getContext().setAuthentication(auth);
            }
        }

        filterChain.doFilter(request, response);
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (bearer != null && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}

