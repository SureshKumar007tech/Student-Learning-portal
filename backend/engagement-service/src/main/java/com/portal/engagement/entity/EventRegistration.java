package com.portal.engagement.entity;

import java.time.LocalDateTime;

public class EventRegistration {
    private Long id;
    private Long eventId;
    private Long studentId;
    private String studentName;
    private String studentEmail;
    private String status;
    private LocalDateTime registeredAt;

    public EventRegistration() {}

    public EventRegistration(Long id, Long eventId, Long studentId, String studentName, String studentEmail, String status, LocalDateTime registeredAt) {
        this.id = id;
        this.eventId = eventId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
        this.status = status;
        this.registeredAt = registeredAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getRegisteredAt() { return registeredAt; }
    public void setRegisteredAt(LocalDateTime registeredAt) { this.registeredAt = registeredAt; }
}

