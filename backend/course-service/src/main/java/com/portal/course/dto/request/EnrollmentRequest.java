package com.portal.course.dto.request;

import jakarta.validation.constraints.NotNull;

public class EnrollmentRequest {
    @NotNull(message = "Course ID is required")
    private Long courseId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    public EnrollmentRequest() {}

    public EnrollmentRequest(Long courseId, Long studentId) {
        this.courseId = courseId;
        this.studentId = studentId;
    }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }
}

