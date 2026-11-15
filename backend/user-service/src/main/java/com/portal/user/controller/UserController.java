package com.portal.user.controller;

import com.portal.user.config.UserAuthDetails;
import com.portal.user.dto.request.UpdateRoleRequest;
import com.portal.user.dto.response.ApiResponse;
import com.portal.user.dto.response.UserResponse;
import com.portal.user.exception.UnauthorizedException;
import com.portal.user.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        assertAdminOrSelf(id);
        UserResponse response = userService.getUserById(id);
        return ResponseEntity.ok(ApiResponse.ok("User retrieved successfully", response));
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        assertAdmin();
        List<UserResponse> list = userService.getAllUsers();
        return ResponseEntity.ok(ApiResponse.ok("Users retrieved successfully", list));
    }

    @PutMapping("/{id}/role")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserRole(
            @PathVariable Long id,
            @Valid @RequestBody UpdateRoleRequest request) {

        assertAdmin();
        UserResponse response = userService.updateUserRole(id, request.getRole());
        return ResponseEntity.ok(ApiResponse.ok("User role updated successfully", response));
    }

    private void assertAdmin() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Authentication required.");
        }

        boolean hasAdminAuthority = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (!hasAdminAuthority) {
            throw new UnauthorizedException("Access denied: Elevated administrator privileges required.");
        }
    }

    private void assertAdminOrSelf(Long targetId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new UnauthorizedException("Authentication required.");
        }

        boolean hasAdminAuthority = auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        if (hasAdminAuthority) {
            return;
        }

        // Verify record ownership via authenticated details
        if (auth.getDetails() instanceof UserAuthDetails details) {
            if (details.userId() != null && details.userId().equals(targetId)) {
                return;
            }
        }

        // Fallback: verify ownership by authenticated username
        String authUsername = auth.getName();
        if (authUsername != null && !authUsername.isBlank()) {
            try {
                UserResponse targetUser = userService.getUserById(targetId);
                if (authUsername.equalsIgnoreCase(targetUser.getUsername())) {
                    return;
                }
            } catch (Exception ignored) {}
        }

        throw new UnauthorizedException("Access denied: You cannot view or modify another user's account.");
    }
}
