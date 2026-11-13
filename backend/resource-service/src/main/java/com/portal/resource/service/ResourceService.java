package com.portal.resource.service;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.dto.response.ResourceResponse;

import java.util.List;

public interface ResourceService {
    List<ResourceResponse> getAllResources(String type);
    ResourceResponse getResourceById(Long id);
    ResourceResponse createResource(CreateResourceRequest request);
    ResourceResponse downloadResource(Long id);
}

