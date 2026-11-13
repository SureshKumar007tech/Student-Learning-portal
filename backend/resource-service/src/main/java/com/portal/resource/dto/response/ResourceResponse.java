package com.portal.resource.dto.response;

import java.time.LocalDateTime;

public class ResourceResponse {
    private Long id;
    private String title;
    private String description;
    private String resourceType;
    private String fileUrl;
    private Long courseIdRef;
    private int downloadCount;
    private LocalDateTime createdAt;

    public ResourceResponse() {}

    public ResourceResponse(Long id, String title, String description, String resourceType, String fileUrl, Long courseIdRef, int downloadCount, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.resourceType = resourceType;
        this.fileUrl = fileUrl;
        this.courseIdRef = courseIdRef;
        this.downloadCount = downloadCount;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public int getDownloadCount() { return downloadCount; }
    public void setDownloadCount(int downloadCount) { this.downloadCount = downloadCount; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

