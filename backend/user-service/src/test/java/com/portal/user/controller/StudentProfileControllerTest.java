package com.portal.user.controller;

import com.portal.user.dto.request.UpdateProfileRequest;
import com.portal.user.dto.response.StudentProfileResponse;
import com.portal.user.exception.UnauthorizedException;
import com.portal.user.service.StudentProfileService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class StudentProfileControllerTest {

    private StudentProfileServiceStub profileService;
    private StudentProfileController controller;

    static class StudentProfileServiceStub implements StudentProfileService {
        @Override
        public StudentProfileResponse getProfileByUserId(Long userId) {
            return new StudentProfileResponse(1L, userId, "student1", "s1@test.com", "Student One", "ROLE_STUDENT", "bio", "avatar", 5, "goals", LocalDateTime.now());
        }

        @Override
        public StudentProfileResponse getProfileByUsername(String username) {
            return new StudentProfileResponse(1L, 10L, username, "s10@test.com", "Student Ten", "ROLE_STUDENT", "bio", "avatar", 5, "goals", LocalDateTime.now());
        }

        @Override
        public StudentProfileResponse updateProfile(Long userId, UpdateProfileRequest request) {
            return new StudentProfileResponse(1L, userId, "student1", "s1@test.com", "Student One", "ROLE_STUDENT", request.getBio(), "avatar", 5, request.getLearningGoals(), LocalDateTime.now());
        }

        @Override
        public void recordPortalVisit(Long userId) {}
    }

    @BeforeEach
    void setUp() {
        profileService = new StudentProfileServiceStub();
        controller = new StudentProfileController(profileService);
    }

    @Test
    void getMyProfile_WhenStudentAccessesOwnProfile_ShouldSucceed() {
        var response = controller.getMyProfile("10", "ROLE_STUDENT", 10L, null);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getUserId()).isEqualTo(10L);
    }

    @Test
    void getMyProfile_WhenStudentTriesToAccessAnotherStudentProfile_ShouldThrowUnauthorized() {
        // Authenticated user 10 passes query param userId=99
        assertThatThrownBy(() -> controller.getMyProfile("10", "ROLE_STUDENT", 99L, null))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("cannot view another student's profile");
    }

    @Test
    void updateMyProfile_WhenStudentTriesToModifyAnotherStudentProfile_ShouldThrowUnauthorized() {
        UpdateProfileRequest request = new UpdateProfileRequest();
        request.setBio("Malicious Bio");

        // Authenticated user 10 passes query param userId=99
        assertThatThrownBy(() -> controller.updateMyProfile("10", "ROLE_STUDENT", 99L, request))
                .isInstanceOf(UnauthorizedException.class)
                .hasMessageContaining("cannot modify another student's profile");
    }

    @Test
    void getMyProfile_WhenAdminAccessesAnyStudentProfile_ShouldSucceed() {
        // Admin user 1 accesses student 99
        var response = controller.getMyProfile("1", "ROLE_ADMIN", 99L, null);
        assertThat(response.getBody()).isNotNull();
        assertThat(response.getBody().getData().getUserId()).isEqualTo(99L);
    }
}
