package com.portal.user.service;

import com.portal.user.config.JwtTokenProvider;
import com.portal.user.dto.request.LoginRequest;
import com.portal.user.dto.request.RegisterRequest;
import com.portal.user.dto.response.AuthResponse;
import com.portal.user.entity.StudentProfile;
import com.portal.user.entity.User;
import com.portal.user.exception.DuplicateResourceException;
import com.portal.user.exception.UnauthorizedException;
import com.portal.user.repository.StudentProfileRepository;
import com.portal.user.repository.UserRepository;
import com.portal.user.service.impl.AuthServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class AuthServiceTest {

    private UserRepositoryStub userRepository;
    private StudentProfileRepositoryStub profileRepository;
    private AuthServiceImpl authService;

    static class UserRepositoryStub extends UserRepository {
        Map<Long, User> users = new HashMap<>();
        long nextId = 1L;

        public UserRepositoryStub() {
            super(null);
        }

        @Override
        public boolean existsByUsername(String username) {
            return users.values().stream().anyMatch(u -> u.getUsername().equalsIgnoreCase(username));
        }

        @Override
        public boolean existsByEmail(String email) {
            return users.values().stream().anyMatch(u -> u.getEmail().equalsIgnoreCase(email));
        }

        @Override
        public Optional<User> findByUsername(String username) {
            return users.values().stream().filter(u -> u.getUsername().equalsIgnoreCase(username)).findFirst();
        }

        @Override
        public Optional<User> findById(Long id) {
            return Optional.ofNullable(users.get(id));
        }

        @Override
        public User save(User user) {
            if (user.getId() == null) {
                user.setId(nextId++);
            }
            users.put(user.getId(), user);
            return user;
        }

        @Override
        public void update(User user) {
            users.put(user.getId(), user);
        }
    }

    static class StudentProfileRepositoryStub extends StudentProfileRepository {
        Map<Long, StudentProfile> profiles = new HashMap<>();
        long nextId = 1L;

        public StudentProfileRepositoryStub() {
            super(null);
        }

        @Override
        public Optional<StudentProfile> findByUserId(Long userId) {
            return profiles.values().stream().filter(p -> Objects.equals(p.getUserId(), userId)).findFirst();
        }

        @Override
        public StudentProfile save(StudentProfile p) {
            if (p.getId() == null) {
                p.setId(nextId++);
            }
            profiles.put(p.getId(), p);
            return p;
        }
    }

    static class SimplePasswordEncoder implements PasswordEncoder {
        @Override
        public String encode(CharSequence rawPassword) {
            return "enc_" + rawPassword;
        }

        @Override
        public boolean matches(CharSequence rawPassword, String encodedPassword) {
            return ("enc_" + rawPassword).equals(encodedPassword);
        }
    }

    static class SimpleJwtTokenProvider extends JwtTokenProvider {
        @Override
        public String generateToken(Long userId, String username, String email, String role) {
            return "mocked.jwt." + username + "." + role;
        }
    }

    @BeforeEach
    void setUp() {
        userRepository = new UserRepositoryStub();
        profileRepository = new StudentProfileRepositoryStub();
        PasswordEncoder passwordEncoder = new SimplePasswordEncoder();
        JwtTokenProvider jwtTokenProvider = new SimpleJwtTokenProvider();
        authService = new AuthServiceImpl(userRepository, profileRepository, passwordEncoder, jwtTokenProvider);
    }

    @Test
    void register_WhenValidRequest_ShouldCreateUserAndReturnToken() {
        RegisterRequest request = new RegisterRequest("john_doe", "john@example.com", "pass123", "John", "Doe", "STUDENT");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).contains("john_doe");
        assertThat(response.getRole()).isEqualTo("ROLE_STUDENT");
        assertThat(response.getUsername()).isEqualTo("john_doe");
    }

    @Test
    void register_WhenUserAttemptsToClaimAdminRole_ShouldEnforceStudentRole() {
        // Attacker sends role="ADMIN" or "ROLE_ADMIN" in public registration
        RegisterRequest attackRequest = new RegisterRequest("hacker", "hacker@example.com", "pass123", "Hack", "Er", "ROLE_ADMIN");

        AuthResponse response = authService.register(attackRequest);

        // Security check: Must be forced to ROLE_STUDENT
        assertThat(response.getRole()).isEqualTo("ROLE_STUDENT");
        User savedUser = userRepository.users.get(response.getUserId());
        assertThat(savedUser.getRole()).isEqualTo("ROLE_STUDENT");
    }

    @Test
    void register_WhenDuplicateUsername_ShouldThrowException() {
        User existing = new User();
        existing.setUsername("existing_user");
        existing.setEmail("other@example.com");
        existing.setPasswordHash("enc_pass");
        userRepository.save(existing);

        RegisterRequest request = new RegisterRequest("existing_user", "test@example.com", "pass123", "Test", "User", null);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void login_WhenValidCredentials_ShouldReturnAuthResponse() {
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john@example.com");
        user.setPasswordHash("enc_pass123");
        user.setRole("ROLE_STUDENT");
        userRepository.save(user);

        LoginRequest request = new LoginRequest("john_doe", "pass123");
        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isNotBlank();
        assertThat(response.getUsername()).isEqualTo("john_doe");
    }

    @Test
    void login_WhenWrongPassword_ShouldThrowUnauthorized() {
        User user = new User();
        user.setUsername("john_doe");
        user.setEmail("john@example.com");
        user.setPasswordHash("enc_correctpass");
        user.setRole("ROLE_STUDENT");
        userRepository.save(user);

        LoginRequest request = new LoginRequest("john_doe", "wrongpass");

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }
}
