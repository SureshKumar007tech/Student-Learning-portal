package com.portal.resource.service.impl;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.dto.response.ResourceResponse;
import com.portal.resource.entity.Resource;
import com.portal.resource.exception.ResourceNotFoundException;
import com.portal.resource.repository.ResourceRepository;
import com.portal.resource.service.ResourceService;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class ResourceServiceImpl implements ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceServiceImpl(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    @Override
    public List<ResourceResponse> getAllResources(String type) {
        List<Resource> resources;
        if (type != null && !type.isBlank() && !type.equalsIgnoreCase("All")) {
            resources = resourceRepository.findByType(type.trim());
        } else {
            resources = resourceRepository.findAll();
        }

        return resources.stream().map(this::toResponse).collect(Collectors.toList());
    }

    @Override
    public ResourceResponse getResourceById(Long id) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        return toResponse(r);
    }

    @Override
    public ResourceResponse createResource(CreateResourceRequest request) {
        Resource r = new Resource();
        r.setTitle(request.getTitle().trim());
        r.setDescription(request.getDescription().trim());
        r.setResourceType(request.getResourceType().trim().toUpperCase());
        r.setFileUrl(request.getFileUrl());
        r.setCourseIdRef(request.getCourseIdRef());
        r.setDownloadCount(0);

        Resource saved = resourceRepository.save(r);
        return toResponse(saved);
    }

    @Override
    public ResourceResponse downloadResource(Long id) {
        Resource r = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found with id: " + id));
        resourceRepository.incrementDownloadCount(id);
        r.setDownloadCount(r.getDownloadCount() + 1);
        return toResponse(r);
    }

    private ResourceResponse toResponse(Resource r) {
        return new ResourceResponse(
                r.getId(),
                r.getTitle(),
                r.getDescription(),
                r.getResourceType(),
                r.getFileUrl(),
                r.getCourseIdRef(),
                r.getDownloadCount(),
                r.getCreatedAt()
        );
    }
}

