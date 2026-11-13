package com.portal.course.entity;

import java.time.LocalDateTime;

public class Enrollment {
    private Long id;
    private Long courseId;
    private Long studentId;
    private String status;
    private int progressPercent;
    private LocalDateTime enrolledAt;
    private LocalDateTime completedAt;

    public Enrollment() {}

    public Enrollment(Long id, Long courseId, Long studentId, String status, int progressPercent, LocalDateTime enrolledAt, LocalDateTime completedAt) {
        this.id = id;
        this.courseId = courseId;
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

