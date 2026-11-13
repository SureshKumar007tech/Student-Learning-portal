package com.portal.course.service;

import com.portal.course.dto.request.EnrollmentRequest;
import com.portal.course.dto.request.UpdateProgressRequest;
import com.portal.course.dto.response.EnrollmentResponse;

import java.util.List;

public interface EnrollmentService {
    EnrollmentResponse enrollStudent(EnrollmentRequest request);
    List<EnrollmentResponse> getStudentEnrollments(Long studentId);
    EnrollmentResponse updateProgress(Long enrollmentId, UpdateProgressRequest request);
}

