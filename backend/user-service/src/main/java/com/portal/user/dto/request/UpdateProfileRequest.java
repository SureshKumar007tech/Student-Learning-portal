package com.portal.user.dto.request;

public class UpdateProfileRequest {
    private String bio;
    private String avatarUrl;
    private String learningGoals;
    private Integer visitsIncrement;

    public UpdateProfileRequest() {}

    public UpdateProfileRequest(String bio, String avatarUrl, String learningGoals, Integer visitsIncrement) {
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.learningGoals = learningGoals;
        this.visitsIncrement = visitsIncrement;
    }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getLearningGoals() { return learningGoals; }
    public void setLearningGoals(String learningGoals) { this.learningGoals = learningGoals; }

    public Integer getVisitsIncrement() { return visitsIncrement; }
    public void setVisitsIncrement(Integer visitsIncrement) { this.visitsIncrement = visitsIncrement; }
}

