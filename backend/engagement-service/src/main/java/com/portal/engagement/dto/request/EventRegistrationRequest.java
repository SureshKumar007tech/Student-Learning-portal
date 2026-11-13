package com.portal.engagement.dto.request;

import jakarta.validation.constraints.NotNull;

public class EventRegistrationRequest {
    @NotNull(message = "Event ID is required")
    private Long eventId;

    @NotNull(message = "Student ID is required")
    private Long studentId;

    private String studentName;
    private String studentEmail;

    public EventRegistrationRequest() {}

    public EventRegistrationRequest(Long eventId, Long studentId, String studentName, String studentEmail) {
        this.eventId = eventId;
        this.studentId = studentId;
        this.studentName = studentName;
        this.studentEmail = studentEmail;
    }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getStudentId() { return studentId; }
    public void setStudentId(Long studentId) { this.studentId = studentId; }

    public String getStudentName() { return studentName; }
    public void setStudentName(String studentName) { this.studentName = studentName; }

    public String getStudentEmail() { return studentEmail; }
    public void setStudentEmail(String studentEmail) { this.studentEmail = studentEmail; }
}

