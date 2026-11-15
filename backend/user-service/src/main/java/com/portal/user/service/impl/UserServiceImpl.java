package com.portal.user.service.impl;

import com.portal.user.dto.response.UserResponse;
import com.portal.user.entity.User;
import com.portal.user.exception.BadRequestException;
import com.portal.user.exception.ResourceNotFoundException;
import com.portal.user.repository.UserRepository;
import com.portal.user.service.UserService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserResponse getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return toResponse(user);
    }

    @Override
    public UserResponse getUserByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return toResponse(user);
    }

    @Override
    public List<UserResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public UserResponse updateUserRole(Long userId, String newRole) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        if (newRole == null || newRole.isBlank()) {
            throw new BadRequestException("Role cannot be empty");
        }

        String normalized = newRole.trim().toUpperCase();
        if (!normalized.startsWith("ROLE_")) {
            normalized = "ROLE_" + normalized;
        }

        if (!normalized.equals("ROLE_STUDENT") && !normalized.equals("ROLE_ADMIN") &&
            !normalized.equals("ROLE_FACULTY") && !normalized.equals("ROLE_INSTRUCTOR")) {
            throw new BadRequestException("Invalid role specified: " + newRole);
        }

        user.setRole(normalized);
        userRepository.update(user);
        return toResponse(user);
    }

    private UserResponse toResponse(User user) {
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
