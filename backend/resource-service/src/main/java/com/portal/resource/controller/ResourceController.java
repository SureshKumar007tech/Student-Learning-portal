package com.portal.resource.controller;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.dto.response.ApiResponse;
import com.portal.resource.dto.response.ResourceResponse;
import com.portal.resource.service.ResourceService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/resources")
public class ResourceController {

    private final ResourceService resourceService;

    public ResourceController(ResourceService resourceService) {
        this.resourceService = resourceService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getAllResources(@RequestParam(required = false) String type) {
        List<ResourceResponse> list = resourceService.getAllResources(type);
        return ResponseEntity.ok(ApiResponse.ok("Resources retrieved successfully", list));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ResourceResponse>> getResourceById(@PathVariable Long id) {
        ResourceResponse res = resourceService.getResourceById(id);
        return ResponseEntity.ok(ApiResponse.ok("Resource retrieved successfully", res));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ResourceResponse>> createResource(@Valid @RequestBody CreateResourceRequest request) {
        ResourceResponse res = resourceService.createResource(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Resource created successfully", res));
    }

    @PostMapping("/{id}/download")
    public ResponseEntity<ApiResponse<ResourceResponse>> downloadResource(@PathVariable Long id) {
        ResourceResponse res = resourceService.downloadResource(id);
        return ResponseEntity.ok(ApiResponse.ok("Resource downloaded successfully", res));
    }
}

