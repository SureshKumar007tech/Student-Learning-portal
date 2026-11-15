package com.portal.user.controller;

import com.portal.user.config.UserAuthDetails;
import com.portal.user.dto.request.UpdateRoleRequest;
import com.portal.user.dto.response.ApiResponse;
import com.portal.user.dto.response.UserResponse;
import com.portal.user.exception.UnauthorizedException;
import com.portal.user.service.UserService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class UserControllerTest {

    private UserServiceStub userService;
    private UserController userController;

    static class UserServiceStub implements UserService {
        private final Map<Long, UserResponse> store = new HashMap<>();

        public UserServiceStub() {
            store.put(1L, new UserResponse(1L, "student1", "s1@example.com", "ROLE_STUDENT", "Student", "One", null, null));
            store.put(2L, new UserResponse(2L, "student2", "s2@example.com", "ROLE_STUDENT", "Student", "Two", null, null));
            store.put(99L, new UserResponse(99L, "admin_user", "admin@portal.edu", "ROLE_ADMIN", "Admin", "User", null, null));
        }

        @Override
        public UserResponse getUserById(Long id) {
            UserResponse u = store.get(id);
            if (u == null) throw new NoSuchElementException("User not found: " + id);
            return u;
        }

        @Override
        public UserResponse getUserByUsername(String username) {
            return store.values().stream()
                    .filter(u -> u.getUsername().equalsIgnoreCase(username))
                    .findFirst()
                    .orElseThrow(() -> new NoSuchElementException("User not found: " + username));
        }

        @Override
        public List<UserResponse> getAllUsers() {
            return new ArrayList<>(store.values());
        }

        @Override
        public UserResponse updateUserRole(Long id, String role) {
            UserResponse old = store.get(id);
            if (old == null) throw new NoSuchElementException("User not found: " + id);
            UserResponse updated = new UserResponse(old.getId(), old.getUsername(), old.getEmail(), role, old.getFirstName(), old.getLastName(), null, null);
            store.put(id, updated);
            return updated;
        }
    }

    @BeforeEach
    void setUp() {
        SecurityContextHolder.clearContext();
        userService = new UserServiceStub();
        userController = new UserController(userService);
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.clearContext();
    }

    private void authenticate(Long userId, String username, String role) {
        SimpleGrantedAuthority auth = new SimpleGrantedAuthority(role);
        UsernamePasswordAuthenticationToken token = new UsernamePasswordAuthenticationToken(
                username, null, Collections.singletonList(auth));
        token.setDetails(new UserAuthDetails(userId, username, role));
        SecurityContextHolder.getContext().setAuthentication(token);
    }

    @Test
    void getUserById_WhenAccessingOwnAccount_ShouldSucceed() {
        authenticate(1L, "student1", "ROLE_STUDENT");

        ResponseEntity<ApiResponse<UserResponse>> response = userController.getUserById(1L);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getId()).isEqualTo(1L);
        assertThat(response.getBody().getData().getUsername()).isEqualTo("student1");
    }

    @Test
    void getUserById_WhenStudentTriesToAccessAnotherStudentAccount_ShouldThrowUnauthorized() {
        authenticate(1L, "student1", "ROLE_STUDENT");

        assertThatThrownBy(() -> userController.getUserById(2L))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("cannot view or modify another user's account");
    }

    @Test
    void getUserById_WhenAdminAccessesAnyAccount_ShouldSucceed() {
        authenticate(99L, "admin_user", "ROLE_ADMIN");

        ResponseEntity<ApiResponse<UserResponse>> response = userController.getUserById(2L);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getId()).isEqualTo(2L);
    }

    @Test
    void getAllUsers_WhenStudentAttemptsAccess_ShouldThrowUnauthorized() {
        authenticate(1L, "student1", "ROLE_STUDENT");

        assertThatThrownBy(() -> userController.getAllUsers())
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Elevated administrator privileges required");
    }

    @Test
    void getAllUsers_WhenAdminAccesses_ShouldReturnAllUsers() {
        authenticate(99L, "admin_user", "ROLE_ADMIN");

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.getAllUsers();
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData()).hasSize(3);
    }

    @Test
    void updateUserRole_WhenStudentAttemptsRoleEscalation_ShouldThrowUnauthorized() {
        authenticate(1L, "student1", "ROLE_STUDENT");
        UpdateRoleRequest request = new UpdateRoleRequest("ROLE_ADMIN");

        assertThatThrownBy(() -> userController.updateUserRole(1L, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("Elevated administrator privileges required");
    }

    @Test
    void updateUserRole_WhenAdminUpdatesRole_ShouldSucceed() {
        authenticate(99L, "admin_user", "ROLE_ADMIN");
        UpdateRoleRequest request = new UpdateRoleRequest("ROLE_INSTRUCTOR");

        ResponseEntity<ApiResponse<UserResponse>> response = userController.updateUserRole(1L, request);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getRole()).isEqualTo("ROLE_INSTRUCTOR");
    }
}
