package com.portal.course.controller;

import com.portal.course.dto.request.CreateCourseRequest;
import com.portal.course.dto.response.ApiResponse;
import com.portal.course.dto.response.CourseResponse;
import com.portal.course.exception.ForbiddenException;
import com.portal.course.service.CourseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/courses")
public class CourseController {

    private final CourseService courseService;

    public CourseController(CourseService courseService) {
        this.courseService = courseService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<CourseResponse>>> getAllCourses(@RequestParam(required = false) String level) {
        List<CourseResponse> courses = courseService.getAllCourses(level);
        return ResponseEntity.ok(ApiResponse.ok("Courses retrieved successfully", courses));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseResponse>> getCourseById(@PathVariable Long id) {
        CourseResponse course = courseService.getCourseById(id);
        return ResponseEntity.ok(ApiResponse.ok("Course retrieved successfully", course));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(
            @Valid @RequestBody CreateCourseRequest request,
            @RequestHeader(value = "X-User-Role", required = false) String xUserRole) {
        if (!"ROLE_ADMIN".equals(xUserRole) && !"ROLE_INSTRUCTOR".equals(xUserRole)) {
            throw new ForbiddenException("Access denied: Only administrators and instructors can create courses");
        }
        CourseResponse response = courseService.createCourse(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Course created successfully", response));
    }
}
