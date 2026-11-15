package com.portal.course.controller;

import com.portal.course.dto.request.EnrollmentRequest;
import com.portal.course.dto.request.UpdateProgressRequest;
import com.portal.course.dto.response.ApiResponse;
import com.portal.course.dto.response.EnrollmentResponse;
import com.portal.course.exception.UnauthorizedException;
import com.portal.course.service.EnrollmentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/enrollments")
public class EnrollmentController {

    private final EnrollmentService enrollmentService;

    public EnrollmentController(EnrollmentService enrollmentService) {
        this.enrollmentService = enrollmentService;
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollStudent(
            @Valid @RequestBody EnrollmentRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        EnrollmentResponse response = enrollmentService.enrollStudent(request, xUserId, xUserRole);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Enrolled in course successfully", response));
    }

    @GetMapping("/my")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getMyEnrollments(
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
        Long studentId = Long.parseLong(xUserId.trim());
        List<EnrollmentResponse> list = enrollmentService.getStudentEnrollments(studentId, xUserId, xUserRole);
        return ResponseEntity.ok(ApiResponse.ok("Enrollments retrieved", list));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getStudentEnrollments(
            @PathVariable Long studentId,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        List<EnrollmentResponse> list = enrollmentService.getStudentEnrollments(studentId, xUserId, xUserRole);
        return ResponseEntity.ok(ApiResponse.ok("Enrollments retrieved", list));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request,
            @RequestHeader(value = "X-User-Id", required = false) String xUserId,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        EnrollmentResponse response = enrollmentService.updateProgress(id, request, xUserId, xUserRole);
        return ResponseEntity.ok(ApiResponse.ok("Progress updated successfully", response));
    }
}
