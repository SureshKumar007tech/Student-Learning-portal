package com.portal.course.controller;

import com.portal.course.dto.request.EnrollmentRequest;
import com.portal.course.dto.request.UpdateProgressRequest;
import com.portal.course.dto.response.ApiResponse;
import com.portal.course.dto.response.EnrollmentResponse;
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
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollStudent(@Valid @RequestBody EnrollmentRequest request) {
        EnrollmentResponse response = enrollmentService.enrollStudent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Enrolled in course successfully", response));
    }

    @GetMapping("/student/{studentId}")
    public ResponseEntity<ApiResponse<List<EnrollmentResponse>>> getStudentEnrollments(@PathVariable Long studentId) {
        List<EnrollmentResponse> list = enrollmentService.getStudentEnrollments(studentId);
        return ResponseEntity.ok(ApiResponse.ok("Enrollments retrieved", list));
    }

    @PutMapping("/{id}/progress")
    public ResponseEntity<ApiResponse<EnrollmentResponse>> updateProgress(
            @PathVariable Long id,
            @Valid @RequestBody UpdateProgressRequest request) {
        EnrollmentResponse response = enrollmentService.updateProgress(id, request);
        return ResponseEntity.ok(ApiResponse.ok("Progress updated successfully", response));
    }
}

