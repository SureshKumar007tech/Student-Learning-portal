package com.portal.user.config;

/**
 * Verified user details stored in SecurityContextHolder authentication.
 */
public record UserAuthDetails(Long userId, String username, String role) {
}
