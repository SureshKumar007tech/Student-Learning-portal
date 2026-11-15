package com.portal.course.service.impl;

import com.portal.course.dto.request.EnrollmentRequest;
import com.portal.course.dto.request.UpdateProgressRequest;
import com.portal.course.dto.response.EnrollmentResponse;
import com.portal.course.entity.Course;
import com.portal.course.entity.Enrollment;
import com.portal.course.exception.DuplicateResourceException;
import com.portal.course.exception.ForbiddenException;
import com.portal.course.exception.ResourceNotFoundException;
import com.portal.course.exception.UnauthorizedException;
import com.portal.course.repository.CourseRepository;
import com.portal.course.repository.EnrollmentRepository;
import com.portal.course.service.EnrollmentService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class EnrollmentServiceImpl implements EnrollmentService {

    private final EnrollmentRepository enrollmentRepository;
    private final CourseRepository courseRepository;

    public EnrollmentServiceImpl(EnrollmentRepository enrollmentRepository, CourseRepository courseRepository) {
        this.enrollmentRepository = enrollmentRepository;
        this.courseRepository = courseRepository;
    }

    @Override
    @Transactional
    public EnrollmentResponse enrollStudent(EnrollmentRequest request, String xUserId, String xUserRole) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required to enroll in a course");
        }

        Long verifiedStudentId;
        if ("ROLE_ADMIN".equals(xUserRole) && request.getStudentId() != null) {
            verifiedStudentId = request.getStudentId();
        } else {
            try {
                verifiedStudentId = Long.parseLong(xUserId.trim());
            } catch (NumberFormatException e) {
                throw new UnauthorizedException("Invalid authenticated user identity");
            }
        }

        Course course = courseRepository.findById(request.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course not found with id: " + request.getCourseId()));

        enrollmentRepository.findByStudentIdAndCourseId(verifiedStudentId, request.getCourseId())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Student is already enrolled in course: " + course.getTitle());
                });

        Enrollment enrollment = new Enrollment();
        enrollment.setCourseId(course.getId());
        enrollment.setStudentId(verifiedStudentId);
        enrollment.setStatus("ENROLLED");
        enrollment.setProgressPercent(0);

        Enrollment saved = enrollmentRepository.save(enrollment);
        return toResponse(saved, course);
    }

    @Override
    public List<EnrollmentResponse> getStudentEnrollments(Long studentId, String xUserId, String xUserRole) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required to access student enrollments");
        }

        Long currentUserId;
        try {
            currentUserId = Long.parseLong(xUserId.trim());
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Invalid authenticated user identity");
        }

        boolean isAdmin = "ROLE_ADMIN".equals(xUserRole);
        if (!isAdmin && !studentId.equals(currentUserId)) {
            throw new ForbiddenException("Access denied: You can only view your own course enrollments");
        }

        List<Enrollment> enrollments = enrollmentRepository.findByStudentId(studentId);
        List<EnrollmentResponse> responses = new ArrayList<>();

        for (Enrollment e : enrollments) {
            Course course = courseRepository.findById(e.getCourseId()).orElse(null);
            responses.add(toResponse(e, course));
        }
        return responses;
    }

    @Override
    @Transactional
    public EnrollmentResponse updateProgress(Long enrollmentId, UpdateProgressRequest request, String xUserId, String xUserRole) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required to update course progress");
        }

        Long currentUserId;
        try {
            currentUserId = Long.parseLong(xUserId.trim());
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Invalid authenticated user identity");
        }

        Enrollment enrollment = enrollmentRepository.findById(enrollmentId)
                .orElseThrow(() -> new ResourceNotFoundException("Enrollment not found with id: " + enrollmentId));

        boolean isAdmin = "ROLE_ADMIN".equals(xUserRole);
        if (!isAdmin && !enrollment.getStudentId().equals(currentUserId)) {
            throw new ForbiddenException("Access denied: You cannot update progress for another student's enrollment");
        }

        int newProgress = request.getProgressPercent();
        String newStatus = enrollment.getStatus();
        LocalDateTime completedAt = enrollment.getCompletedAt();

        if (newProgress >= 100) {
            newProgress = 100;
            newStatus = "COMPLETED";
            if (completedAt == null) completedAt = LocalDateTime.now();
        } else if (newProgress > 0) {
            newStatus = "IN_PROGRESS";
        }

        enrollmentRepository.updateProgress(enrollmentId, newProgress, newStatus, completedAt);
        enrollment.setProgressPercent(newProgress);
        enrollment.setStatus(newStatus);
        enrollment.setCompletedAt(completedAt);

        Course course = courseRepository.findById(enrollment.getCourseId()).orElse(null);
        return toResponse(enrollment, course);
    }

    private EnrollmentResponse toResponse(Enrollment e, Course c) {
        return new EnrollmentResponse(
                e.getId(),
                e.getCourseId(),
                c != null ? c.getCode() : "UNKNOWN",
                c != null ? c.getTitle() : "Unknown Course",
                c != null ? c.getLevel() : "Beginner",
                e.getStudentId(),
                e.getStatus(),
                e.getProgressPercent(),
                e.getEnrolledAt(),
                e.getCompletedAt()
        );
    }
}
