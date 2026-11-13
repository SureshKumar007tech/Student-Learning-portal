package com.portal.engagement.dto.response;

import java.time.LocalDateTime;

public class InquiryResponse {
    private Long id;
    private String name;
    private String email;
    private String message;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime resolvedAt;

    public InquiryResponse() {}

    public InquiryResponse(Long id, String name, String email, String message, String status, LocalDateTime createdAt, LocalDateTime resolvedAt) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.message = message;
        this.status = status;
        this.createdAt = createdAt;
        this.resolvedAt = resolvedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getResolvedAt() { return resolvedAt; }
    public void setResolvedAt(LocalDateTime resolvedAt) { this.resolvedAt = resolvedAt; }
}

