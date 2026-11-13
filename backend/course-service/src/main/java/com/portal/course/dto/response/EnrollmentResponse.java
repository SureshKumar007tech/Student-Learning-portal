package com.portal.course.dto.response;

import java.time.LocalDateTime;

public class EnrollmentResponse {
    private Long id;
    private Long courseId;
    private String courseCode;
    private String courseTitle;
    private String courseLevel;
    private Long studentId;
    private String status;
    private int progressPercent;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public EnrollmentResponse() {}

    public EnrollmentResponse(Long id, Long courseId, String courseCode, String courseTitle, String courseLevel, Long studentId, String status, int progressPercent, LocalDateTime enrolledAt, LocalDateTime completedAt) {
        this.id = id;
        this.courseId = courseId;
        this.courseCode = courseCode;
        this.courseTitle = courseTitle;
        this.courseLevel = courseLevel;
        this.studentId = studentId;
        this.status = status;
        this.progressPercent = progressPercent;
        this.enrolledAt = enrolledAt;
        this.completedAt = completedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getCourseId() { return courseId; }
    public void setCourseId(Long courseId) { this.courseId = courseId; }

    public String getCourseCode() { return courseCode; }
    public void setCourseCode(String courseCode) { this.courseCode = courseCode; }

    public String getCourseTitle() { return courseTitle; }
    public void setCourseTitle(String courseTitle) { this.courseTitle = courseTitle; }

    public String getCourseLevel() { return courseLevel; }
    public void setCourseLevel(String courseLevel) { this.courseLevel = courseLevel; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public int getProgressPercent() { return progressPercent; }
    public void setProgressPercent(int progressPercent) { this.progressPercent = progressPercent; }

    public LocalDateTime getEnrolledAt() { return enrolledAt; }
    public void setEnrolledAt(LocalDateTime enrolledAt) { this.enrolledAt = enrolledAt; }

    public LocalDateTime getCompletedAt() { return completedAt; }
    public void setCompletedAt(LocalDateTime completedAt) { this.completedAt = completedAt; }
}

