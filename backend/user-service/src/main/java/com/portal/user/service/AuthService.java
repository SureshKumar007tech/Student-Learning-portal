package com.portal.user.service;

import com.portal.user.dto.request.LoginRequest;
import com.portal.user.dto.request.RegisterRequest;
import com.portal.user.dto.response.AuthResponse;
import com.portal.user.dto.response.UserResponse;

public interface AuthService {
    AuthResponse register(RegisterRequest request);
    AuthResponse registerInternal(RegisterRequest request, String role);
    AuthResponse login(LoginRequest request);
    UserResponse getCurrentUser(String username);
}
