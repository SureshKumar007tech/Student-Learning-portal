package com.portal.course.service;

import com.portal.course.dto.request.EnrollmentRequest;
import com.portal.course.dto.request.UpdateProgressRequest;
import com.portal.course.dto.response.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {
    EnrollmentResponse enrollStudent(EnrollmentRequest request, String xUserId, String xUserRole);
    List<EnrollmentResponse> getStudentEnrollments(Long studentId, String xUserId, String xUserRole);
    EnrollmentResponse updateProgress(Long enrollmentId, UpdateProgressRequest request, String xUserId, String xUserRole);
}
