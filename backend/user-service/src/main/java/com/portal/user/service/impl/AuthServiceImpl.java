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
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username '" + request.getUsername() + "' is already taken");
        }
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email '" + request.getEmail() + "' is already registered");
        }

        String role = (request.getRole() != null && !request.getRole().isBlank())
                ? request.getRole().toUpperCase()
                : "ROLE_STUDENT";

        if (!role.startsWith("ROLE_")) {
            role = "ROLE_" + role;
        }

        User user = new User();
        user.setUsername(request.getUsername().trim());
        user.setEmail(request.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName().trim());
        user.setLastName(request.getLastName().trim());
        user.setRole(role);

        User savedUser = userRepository.save(user);

        // Create default profile for the user
        StudentProfile profile = new StudentProfile();
        profile.setUserId(savedUser.getId());
        profile.setBio("Student at Student Learning Portal");
        profile.setVisitsCount(1);
        profile.setLearningGoals("Master web development and software architecture");
        profile.setLastLogin(LocalDateTime.now());
        profileRepository.save(profile);

        String token = jwtTokenProvider.generateToken(savedUser.getId(), savedUser.getUsername(), savedUser.getEmail(), savedUser.getRole());

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
        String input = request.getUsernameOrEmail().trim();
        User user = userRepository.findByUsername(input)
                .or(() -> userRepository.findByEmail(input.toLowerCase()))
                .orElseThrow(() -> new UnauthorizedException("Invalid username or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new UnauthorizedException("Invalid username or password");
        }

        // Update last login & visits
        profileRepository.findByUserId(user.getId()).ifPresent(profile -> {
            profile.setLastLogin(LocalDateTime.now());
            profile.setVisitsCount(profile.getVisitsCount() + 1);
            profileRepository.update(profile);
        });

        String token = jwtTokenProvider.generateToken(user.getId(), user.getUsername(), user.getEmail(), user.getRole());

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

        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getRole(),
                user.getFirstName(),
                user.getLastName(),
                user.getCreatedAt()
        );
    }
}

