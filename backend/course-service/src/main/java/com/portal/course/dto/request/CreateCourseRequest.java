package com.portal.course.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateCourseRequest {
    @NotBlank(message = "Course code is required")
    private String code;

    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Level is required (Beginner, Intermediate, Advanced)")
    private String level;

    private Long instructorId;
    private int durationHours = 10;

    public CreateCourseRequest() {}

    public CreateCourseRequest(String code, String title, String description, String level, Long instructorId, int durationHours) {
        this.code = code;
        this.title = title;
        this.description = description;
        this.level = level;
        this.instructorId = instructorId;
        this.durationHours = durationHours;
    }

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
}

