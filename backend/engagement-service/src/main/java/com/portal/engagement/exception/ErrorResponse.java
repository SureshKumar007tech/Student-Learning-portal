package com.portal.engagement.exception;

import java.time.LocalDateTime;
import java.util.Map;

public class ErrorResponse {
    private boolean success = false;
    private String message;
    private int status;
    private String path;
    private String timestamp;
    private Map<String, String> errors;

    public ErrorResponse() {
        this.timestamp = LocalDateTime.now().toString();
    }

    public ErrorResponse(String message, int status, String path) {
        this.success = false;
        this.message = message;
        this.status = status;
        this.path = path;
        this.timestamp = LocalDateTime.now().toString();
    }

    public ErrorResponse(String message, int status, String path, Map<String, String> errors) {
        this.success = false;
        this.message = message;
        this.status = status;
        this.path = path;
        this.timestamp = LocalDateTime.now().toString();
        this.errors = errors;
    }

    public boolean isSuccess() { return success; }
    public void setSuccess(boolean success) { this.success = success; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public int getStatus() { return status; }
    public void setStatus(int status) { this.status = status; }

    public String getPath() { return path; }
    public void setPath(String path) { this.path = path; }

    public String getTimestamp() { return timestamp; }
    public void setTimestamp(String timestamp) { this.timestamp = timestamp; }

    public Map<String, String> getErrors() { return errors; }
    public void setErrors(Map<String, String> errors) { this.errors = errors; }
}

