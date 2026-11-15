package com.portal.engagement.config;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.repository.EventRepository;
import com.portal.engagement.service.EventService;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final EventService eventService;
    private final boolean seedEnabled;

    public DatabaseInitializer(
            EventRepository eventRepository,
            EventService eventService,
            @Value("${portal.seed.enabled:false}") boolean seedEnabled) {
        this.eventRepository = eventRepository;
        this.eventService = eventService;
        this.seedEnabled = seedEnabled;
    }

    @Override
    public void run(String... args) {
        if (!seedEnabled) {
            return;
        }
        if (eventRepository.findAll().isEmpty()) {
            eventService.createEvent(new CreateEventRequest(
                    "Web Workshop",
                    "20 October",
                    "Seminar Hall",
                    "Hands-on web technologies seminar covering frontend and backend integration.",
                    "Computer Science Department",
                    120
            ));

            eventService.createEvent(new CreateEventRequest(
                    "React Project Presentation",
                    "30 October",
                    "Computer Lab",
                    "Students showcase interactive projects built with React, Hooks and modern component design.",
                    "Web Dev Club",
                    80
            ));

            eventService.createEvent(new CreateEventRequest(
                    "Coding Practice Session",
                    "5 November",
                    "Innovation Lab",
                    "Competitive programming and algorithmic problem-solving workshop.",
                    "ACM Student Chapter",
                    60
            ));

            eventService.createEvent(new CreateEventRequest(
                    "Microservices Architecture Hackathon",
                    "15 November",
                    "Auditorium",
                    "Design and build cloud-native distributed microservices with API Gateway.",
                    "Engineering Faculty",
                    200
            ));
        }
    }
}
