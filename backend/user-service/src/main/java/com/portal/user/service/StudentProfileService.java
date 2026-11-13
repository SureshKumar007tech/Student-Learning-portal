package com.portal.user.service;

import com.portal.user.dto.request.UpdateProfileRequest;
import com.portal.user.dto.response.StudentProfileResponse;

public interface StudentProfileService {
    StudentProfileResponse getProfileByUserId(Long userId);
    StudentProfileResponse getProfileByUsername(String username);
    StudentProfileResponse updateProfile(Long userId, UpdateProfileRequest request);
    void recordPortalVisit(Long userId);
}

