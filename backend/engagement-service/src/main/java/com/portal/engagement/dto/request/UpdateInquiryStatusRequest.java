package com.portal.engagement.dto.request;

import jakarta.validation.constraints.NotBlank;

public class UpdateInquiryStatusRequest {
    @NotBlank(message = "Status is required (NEW, IN_PROGRESS, RESOLVED)")
    private String status;

    public UpdateInquiryStatusRequest() {}

    public UpdateInquiryStatusRequest(String status) {
        this.status = status;
    }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
}

