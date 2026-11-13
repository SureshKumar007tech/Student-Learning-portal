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
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private StudentProfileRepository profileRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthServiceImpl authService;

    @BeforeEach
    void setUp() {
        authService = new AuthServiceImpl(userRepository, profileRepository, passwordEncoder, jwtTokenProvider);
    }

    @Test
    void register_WhenValidRequest_ShouldCreateUserAndReturnToken() {
        RegisterRequest request = new RegisterRequest("john_doe", "john@example.com", "pass123", "John", "Doe", "STUDENT");

        when(userRepository.existsByUsername("john_doe")).thenReturn(false);
        when(userRepository.existsByEmail("john@example.com")).thenReturn(false);
        when(passwordEncoder.encode("pass123")).thenReturn("encodedPassword");

        User savedUser = new User();
        savedUser.setId(10L);
        savedUser.setUsername("john_doe");
        savedUser.setEmail("john@example.com");
        savedUser.setRole("ROLE_STUDENT");
        savedUser.setFirstName("John");
        savedUser.setLastName("Doe");

        when(userRepository.save(any(User.class))).thenReturn(savedUser);
        when(jwtTokenProvider.generateToken(10L, "john_doe", "john@example.com", "ROLE_STUDENT"))
                .thenReturn("mocked.jwt.token");

        AuthResponse response = authService.register(request);

        assertThat(response).isNotNull();
        assertThat(response.getToken()).isEqualTo("mocked.jwt.token");
        assertThat(response.getUserId()).isEqualTo(10L);
        assertThat(response.getUsername()).isEqualTo("john_doe");
        verify(profileRepository).save(any(StudentProfile.class));
    }

    @Test
    void register_WhenDuplicateUsername_ShouldThrowException() {
        RegisterRequest request = new RegisterRequest("existing_user", "test@example.com", "pass123", "Test", "User", null);
        when(userRepository.existsByUsername("existing_user")).thenReturn(true);

        assertThatThrownBy(() -> authService.register(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("already taken");
    }

    @Test
    void login_WhenValidCredentials_ShouldReturnAuthResponse() {
        LoginRequest request = new LoginRequest("john_doe", "pass123");

        User user = new User();
        user.setId(10L);
        user.setUsername("john_doe");
        user.setEmail("john@example.com");
        user.setPasswordHash("encodedPassword");
        user.setRole("ROLE_STUDENT");

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("pass123", "encodedPassword")).thenReturn(true);
        when(profileRepository.findByUserId(10L)).thenReturn(Optional.empty());
        when(jwtTokenProvider.generateToken(10L, "john_doe", "john@example.com", "ROLE_STUDENT"))
                .thenReturn("valid.jwt.token");

        AuthResponse response = authService.login(request);

        assertThat(response.getToken()).isEqualTo("valid.jwt.token");
        assertThat(response.getUserId()).isEqualTo(10L);
    }

    @Test
    void login_WhenWrongPassword_ShouldThrowUnauthorized() {
        LoginRequest request = new LoginRequest("john_doe", "wrongpass");

        User user = new User();
        user.setUsername("john_doe");
        user.setPasswordHash("encodedPassword");

        when(userRepository.findByUsername("john_doe")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encodedPassword")).thenReturn(false);

        assertThatThrownBy(() -> authService.login(request))
                .isInstanceOf(UnauthorizedException.class);
    }
}

