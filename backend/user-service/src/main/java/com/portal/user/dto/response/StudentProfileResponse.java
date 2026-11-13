package com.portal.user.dto.response;

import java.time.LocalDateTime;

public class StudentProfileResponse {
    private Long id;
    private Long userId;
    private String username;
    private String email;
    private String fullName;
    private String role;
    private String bio;
    private String avatarUrl;
    private int visitsCount;
    private String learningGoals;
    private LocalDateTime lastLogin;

    public StudentProfileResponse() {}

    public StudentProfileResponse(Long id, Long userId, String username, String email, String fullName, String role, String bio, String avatarUrl, int visitsCount, String learningGoals, LocalDateTime lastLogin) {
        this.id = id;
        this.userId = userId;
        this.username = username;
        this.email = email;
        this.fullName = fullName;
        this.role = role;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.visitsCount = visitsCount;
        this.learningGoals = learningGoals;
        this.lastLogin = lastLogin;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

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
}

