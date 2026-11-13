package com.portal.resource.config;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.repository.ResourceRepository;
import com.portal.resource.service.ResourceService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final ResourceService resourceService;

    public DatabaseInitializer(ResourceRepository resourceRepository, ResourceService resourceService) {
        this.resourceRepository = resourceRepository;
        this.resourceService = resourceService;
    }

    @Override
    public void run(String... args) {
        if (resourceRepository.findAll().isEmpty()) {
            resourceService.createResource(new CreateResourceRequest(
                    "Notes",
                    "HTML, CSS and React notes.",
                    "NOTES",
                    "/files/notes-web-dev.pdf",
                    1L
            ));

            resourceService.createResource(new CreateResourceRequest(
                    "Exercises",
                    "Practice exercises and examples.",
                    "EXERCISES",
                    "/files/exercises-practice.zip",
                    2L
            ));

            resourceService.createResource(new CreateResourceRequest(
                    "Projects",
                    "Web development mini projects.",
                    "PROJECTS",
                    "/files/starter-projects.zip",
                    3L
            ));

            resourceService.createResource(new CreateResourceRequest(
                    "Architecture Cheat Sheet",
                    "Microservices, REST and Database design reference guide.",
                    "CHEATSHEET",
                    "/files/microservices-guide.pdf",
                    4L
            ));
        }
    }
}

