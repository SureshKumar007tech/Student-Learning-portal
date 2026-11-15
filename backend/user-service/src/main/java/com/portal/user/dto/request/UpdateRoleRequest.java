package com.portal.user.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

public class UpdateRoleRequest {

    @NotBlank(message = "Role must not be blank")
    @Pattern(regexp = "^(ROLE_STUDENT|ROLE_ADMIN|ROLE_FACULTY|ROLE_INSTRUCTOR|STUDENT|ADMIN|FACULTY|INSTRUCTOR)$",
            message = "Role must be one of: ROLE_STUDENT, ROLE_ADMIN, ROLE_FACULTY, ROLE_INSTRUCTOR")
    private String role;

    public UpdateRoleRequest() {}

    public UpdateRoleRequest(String role) {
        this.role = role;
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
