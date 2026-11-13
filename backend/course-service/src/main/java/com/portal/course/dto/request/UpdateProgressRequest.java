package com.portal.course.dto.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

public class UpdateProgressRequest {
    @NotNull(message = "Progress percentage is required")
    @Min(value = 0, message = "Progress cannot be negative")
    @Max(value = 100, message = "Progress cannot exceed 100")
    private Integer progressPercent;

    public UpdateProgressRequest() {}

    public UpdateProgressRequest(Integer progressPercent) {
        this.progressPercent = progressPercent;
    }

    public Integer getProgressPercent() { return progressPercent; }
    public void setProgressPercent(Integer progressPercent) { this.progressPercent = progressPercent; }
}

