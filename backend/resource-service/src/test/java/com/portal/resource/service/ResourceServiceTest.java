package com.portal.resource.service;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.dto.response.ResourceResponse;
import com.portal.resource.entity.Resource;
import com.portal.resource.exception.ResourceNotFoundException;
import com.portal.resource.repository.ResourceRepository;
import com.portal.resource.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class ResourceServiceTest {

    private ResourceRepositoryStub resourceRepository;
    private ResourceServiceImpl resourceService;

    static class ResourceRepositoryStub extends ResourceRepository {
        Map<Long, Resource> resources = new HashMap<>();
        long nextId = 1L;
        boolean incrementCalled = false;

        public ResourceRepositoryStub() {
            super(null);
        }

        @Override
        public List<Resource> findAll() {
            return new ArrayList<>(resources.values());
        }

        @Override
        public Optional<Resource> findById(Long id) {
            return Optional.ofNullable(resources.get(id));
        }

        @Override
        public Resource save(Resource r) {
            if (r.getId() == null) {
                r.setId(nextId++);
            }
            resources.put(r.getId(), r);
            return r;
        }

        @Override
        public void incrementDownloadCount(Long id) {
            incrementCalled = true;
        }
    }

    @BeforeEach
    void setUp() {
        resourceRepository = new ResourceRepositoryStub();
        resourceService = new ResourceServiceImpl(resourceRepository);
    }

    @Test
    void getAllResources_ShouldReturnList() {
        Resource r1 = new Resource();
        r1.setId(1L);
        r1.setTitle("Notes");
        r1.setResourceType("NOTES");
        resourceRepository.resources.put(1L, r1);

        List<ResourceResponse> list = resourceService.getAllResources("All");

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getTitle()).isEqualTo("Notes");
    }

    @Test
    void downloadResource_WhenExists_ShouldIncrementDownloadCount() {
        Resource r = new Resource();
        r.setId(1L);
        r.setTitle("Notes");
        r.setDownloadCount(5);
        resourceRepository.resources.put(1L, r);

        ResourceResponse response = resourceService.downloadResource(1L);

        assertThat(response.getDownloadCount()).isEqualTo(6);
        assertThat(resourceRepository.incrementCalled).isTrue();
    }

    @Test
    void getResourceById_WhenNotFound_ShouldThrowException() {
        assertThatThrownBy(() -> resourceService.getResourceById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}
