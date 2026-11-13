package com.portal.course.entity;

import java.time.LocalDateTime;

public class Course {
    private Long id;
    private String code;
    private String title;
    private String description;
    private String level;
    private Long instructorId;
    private int durationHours;
    private boolean isActive;
    private LocalDateTime createdAt;

    public Course() {}

    public Course(Long id, String code, String title, String description, String level, Long instructorId, int durationHours, boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.description = description;
        this.level = level;
        this.instructorId = instructorId;
        this.durationHours = durationHours;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getLevel() { return level; }
    public void setLevel(String level) { this.level = level; }

    public Long getInstructorId() { return instructorId; }
    public void setInstructorId(Long instructorId) { this.instructorId = instructorId; }

    public int getDurationHours() { return durationHours; }
    public void setDurationHours(int durationHours) { this.durationHours = durationHours; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

