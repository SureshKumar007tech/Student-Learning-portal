package com.portal.resource.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateResourceRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 100, message = "Title must be between 2 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Resource type is required (e.g. NOTES, EXERCISES, PROJECTS, CHEATSHEET)")
    private String resourceType;

    private String fileUrl;
    private Long courseIdRef;

    public CreateResourceRequest() {}

    public CreateResourceRequest(String title, String description, String resourceType, String fileUrl, Long courseIdRef) {
        this.title = title;
        this.description = description;
        this.resourceType = resourceType;
        this.fileUrl = fileUrl;
        this.courseIdRef = courseIdRef;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getResourceType() { return resourceType; }
    public void setResourceType(String resourceType) { this.resourceType = resourceType; }

    public String getFileUrl() { return fileUrl; }
    public void setFileUrl(String fileUrl) { this.fileUrl = fileUrl; }

    public Long getCourseIdRef() { return courseIdRef; }
    public void setCourseIdRef(Long courseIdRef) { this.courseIdRef = courseIdRef; }
}

