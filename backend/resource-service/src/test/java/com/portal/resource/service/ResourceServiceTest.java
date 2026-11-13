package com.portal.resource.service;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.dto.response.ResourceResponse;
import com.portal.resource.entity.Resource;
import com.portal.resource.exception.ResourceNotFoundException;
import com.portal.resource.repository.ResourceRepository;
import com.portal.resource.service.impl.ResourceServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    private ResourceServiceImpl resourceService;

    @BeforeEach
    void setUp() {
        resourceService = new ResourceServiceImpl(resourceRepository);
    }

    @Test
    void getAllResources_ShouldReturnList() {
        Resource r1 = new Resource();
        r1.setId(1L);
        r1.setTitle("Notes");
        r1.setResourceType("NOTES");

        when(resourceRepository.findAll()).thenReturn(List.of(r1));

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

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(r));

        ResourceResponse response = resourceService.downloadResource(1L);

        assertThat(response.getDownloadCount()).isEqualTo(6);
        verify(resourceRepository).incrementDownloadCount(1L);
    }

    @Test
    void getResourceById_WhenNotFound_ShouldThrowException() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> resourceService.getResourceById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

