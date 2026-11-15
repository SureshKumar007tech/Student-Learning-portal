package com.portal.user.service.impl;

import com.portal.user.config.JwtTokenProvider;
import com.portal.user.dto.request.LoginRequest;
import com.portal.user.dto.request.RegisterRequest;
import com.portal.user.dto.response.AuthResponse;
import com.portal.user.dto.response.UserResponse;
import com.portal.user.entity.StudentProfile;
import com.portal.user.entity.User;
import com.portal.user.exception.BadRequestException;
import com.portal.user.exception.DuplicateResourceException;
import com.portal.user.exception.ResourceNotFoundException;
import com.portal.user.exception.UnauthorizedException;
import com.portal.user.repository.StudentProfileRepository;
import com.portal.user.repository.UserRepository;
import com.portal.user.service.AuthService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final StudentProfileRepository profileRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    public AuthServiceImpl(UserRepository userRepository,
                           StudentProfileRepository profileRepository,
                           PasswordEncoder passwordEncoder,
                           JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.profileRepository = profileRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtTokenProvider = jwtTokenProvider;
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // SECURITY REQUIREMENT 2: Public registration must NOT accept a user-selected role.
        // Self-registered accounts must unconditionally receive ROLE_STUDENT.
        return doRegister(request, "ROLE_STUDENT");
    }

    @Override
    @Transactional
    public AuthResponse registerInternal(RegisterRequest request, String role) {
        String normalizedRole = (role != null && !role.isBlank()) ? role.trim().toUpperCase() : "ROLE_STUDENT";
        if (!normalizedRole.startsWith("ROLE_")) {
            normalizedRole = "ROLE_" + normalizedRole;
        }
        return doRegister(request, normalizedRole);
    }

    private AuthResponse doRegister(RegisterRequest request, String assignedRole) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(assignedRole);

        User savedUser = userRepository.save(user);

        // Auto-create initial student profile for learners
        StudentProfile profile = new StudentProfile();
        profile.setUserId(savedUser.getId());
        profile.setVisitsCount(1);
        profile.setBio("Student learner enrolled at Student Learning Portal.");
        profile.setLearningGoals("Complete core engineering modules.");
        profile.setLastLogin(LocalDateTime.now());
        profileRepository.save(profile);

        String token = jwtTokenProvider.generateToken(
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole()
        );

        return new AuthResponse(
                token,
                savedUser.getId(),
                savedUser.getUsername(),
                savedUser.getEmail(),
                savedUser.getRole(),
                savedUser.getFirstName(),
                savedUser.getLastName()
        );
    }

    @Override
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsername(identifier)
                .or(() -> userRepository.findByEmail(identifier))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Update last login
        profileRepository.findByUserId(user.getId()).ifPresent(p -> {
            p.setLastLogin(LocalDateTime.now());
            profileRepository.update(p);
        });

        String token = jwtTokenProvider.generateToken(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole()
        );

        return new AuthResponse(
                token,
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName()
        );
    }

    @Override
    public UserResponse getCurrentUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        return toUserResponse(user);
    }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getRole(),
                user.getCreatedAt(),
                user.getUpdatedAt()
        );
    }
}
