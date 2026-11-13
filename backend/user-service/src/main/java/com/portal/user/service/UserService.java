package com.portal.user.service;

import com.portal.user.dto.response.UserResponse;

import java.util.List;

public interface UserService {
    UserResponse getUserById(Long id);
    UserResponse getUserByUsername(String username);
    List<UserResponse> getAllUsers();
}

