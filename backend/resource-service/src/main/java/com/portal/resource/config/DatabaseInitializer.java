package com.portal.resource.config;

import com.portal.resource.dto.request.CreateResourceRequest;
import com.portal.resource.repository.ResourceRepository;
import com.portal.resource.service.ResourceService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final ResourceRepository resourceRepository;
    private final ResourceService resourceService;
    private final boolean seedEnabled;

    public DatabaseInitializer(
            ResourceRepository resourceRepository,
            ResourceService resourceService,
            @Value("${portal.seed.enabled:false}") boolean seedEnabled) {
        this.resourceRepository = resourceRepository;
        this.resourceService = resourceService;
        this.seedEnabled = seedEnabled;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
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
