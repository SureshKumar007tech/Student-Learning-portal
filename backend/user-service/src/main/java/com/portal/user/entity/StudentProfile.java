package com.portal.user.entity;

import java.time.LocalDateTime;

public class StudentProfile {
    private Long id;
    private Long userId;
    private String bio;
    private String avatarUrl;
    private int visitsCount;
    private String learningGoals;
    private LocalDateTime lastLogin;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public StudentProfile() {}

    public StudentProfile(Long id, Long userId, String bio, String avatarUrl, int visitsCount, String learningGoals, LocalDateTime lastLogin, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.userId = userId;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.visitsCount = visitsCount;
        this.learningGoals = learningGoals;
        this.lastLogin = lastLogin;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public int getVisitsCount() { return visitsCount; }
    public void setVisitsCount(int visitsCount) { this.visitsCount = visitsCount; }

    public String getLearningGoals() { return learningGoals; }
    public void setLearningGoals(String learningGoals) { this.learningGoals = learningGoals; }

    public LocalDateTime getLastLogin() { return lastLogin; }
    public void setLastLogin(LocalDateTime lastLogin) { this.lastLogin = lastLogin; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}

