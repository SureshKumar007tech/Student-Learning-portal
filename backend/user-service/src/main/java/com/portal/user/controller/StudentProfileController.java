package com.portal.user.controller;

import com.portal.user.config.JwtTokenProvider;
import com.portal.user.dto.request.UpdateProfileRequest;
import com.portal.user.dto.response.ApiResponse;
import com.portal.user.dto.response.StudentProfileResponse;
import com.portal.user.service.StudentProfileService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users/profile")
public class StudentProfileController {

    private final StudentProfileService profileService;
    private final JwtTokenProvider tokenProvider;

    public StudentProfileController(StudentProfileService profileService, JwtTokenProvider tokenProvider) {
        this.profileService = profileService;
        this.tokenProvider = tokenProvider;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getMyProfile(
            @AuthenticationPrincipal String username,
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) String studentName) {

        if (username != null && !username.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profileService.getProfileByUsername(username)));
        }
        if (userId != null) {
            return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profileService.getProfileByUserId(userId)));
        }
        if (studentName != null && !studentName.isBlank()) {
            return ResponseEntity.ok(ApiResponse.ok("Profile retrieved", profileService.getProfileByUsername(studentName)));
        }

        // Default to student1 profile if unauthenticated
        return ResponseEntity.ok(ApiResponse.ok("Default profile", profileService.getProfileByUserId(1L)));
    }

    @PutMapping
    public ResponseEntity<ApiResponse<StudentProfileResponse>> updateMyProfile(
            @AuthenticationPrincipal String username,
            @RequestParam(required = false) Long userId,
            @RequestBody UpdateProfileRequest request) {

        Long targetUserId = userId;
        if (targetUserId == null && username != null) {
            targetUserId = profileService.getProfileByUsername(username).getUserId();
        }
        if (targetUserId == null) {
            targetUserId = 1L; // Fallback
        }

        StudentProfileResponse response = profileService.updateProfile(targetUserId, request);
        return ResponseEntity.ok(ApiResponse.ok("Profile updated successfully", response));
    }

    @PostMapping("/visit")
    public ResponseEntity<ApiResponse<Void>> recordVisit(@RequestParam(required = false, defaultValue = "1") Long userId) {
        profileService.recordPortalVisit(userId);
        return ResponseEntity.ok(ApiResponse.ok("Visit recorded", null));
    }
}

