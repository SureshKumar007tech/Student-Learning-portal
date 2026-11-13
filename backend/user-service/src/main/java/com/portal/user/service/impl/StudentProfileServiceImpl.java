package com.portal.user.service.impl;

import com.portal.user.dto.request.UpdateProfileRequest;
import com.portal.user.dto.response.StudentProfileResponse;
import com.portal.user.entity.StudentProfile;
import com.portal.user.entity.User;
import com.portal.user.exception.ResourceNotFoundException;
import com.portal.user.repository.StudentProfileRepository;
import com.portal.user.repository.UserRepository;
import com.portal.user.service.StudentProfileService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class StudentProfileServiceImpl implements StudentProfileService {

    private final StudentProfileRepository profileRepository;
    private final UserRepository userRepository;

    public StudentProfileServiceImpl(StudentProfileRepository profileRepository, UserRepository userRepository) {
        this.profileRepository = profileRepository;
        this.userRepository = userRepository;
    }

    @Override
    public StudentProfileResponse getProfileByUserId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setUserId(userId);
                    newProfile.setBio("Student at Student Learning Portal");
                    newProfile.setVisitsCount(1);
                    return profileRepository.save(newProfile);
                });

        return toResponse(user, profile);
    }

    @Override
    public StudentProfileResponse getProfileByUsername(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with username: " + username));
        return getProfileByUserId(user.getId());
    }

    @Override
    @Transactional
    public StudentProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));

        StudentProfile profile = profileRepository.findByUserId(userId)
                .orElseGet(() -> {
                    StudentProfile newProfile = new StudentProfile();
                    newProfile.setUserId(userId);
                    return profileRepository.save(newProfile);
                });

        if (request.getBio() != null) profile.setBio(request.getBio());
        if (request.getAvatarUrl() != null) profile.setAvatarUrl(request.getAvatarUrl());
        if (request.getLearningGoals() != null) profile.setLearningGoals(request.getLearningGoals());
        if (request.getVisitsIncrement() != null && request.getVisitsIncrement() > 0) {
            profile.setVisitsCount(profile.getVisitsCount() + request.getVisitsIncrement());
        }

        profileRepository.update(profile);
        return toResponse(user, profile);
    }

    @Override
    public void recordPortalVisit(Long userId) {
        profileRepository.incrementVisits(userId);
    }

    private StudentProfileResponse toResponse(User user, StudentProfile profile) {
        String fullName = (user.getFirstName() + " " + user.getLastName()).trim();
        return new StudentProfileResponse(
                profile.getId(),
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                fullName,
                user.getRole(),
                profile.getBio(),
                profile.getAvatarUrl(),
                profile.getVisitsCount(),
                profile.getLearningGoals(),
                profile.getLastLogin()
        );
    }
}

