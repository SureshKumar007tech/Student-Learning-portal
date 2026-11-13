package com.portal.engagement.config;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.repository.EventRepository;
import com.portal.engagement.service.EventService;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DatabaseInitializer implements CommandLineRunner {

    private final EventRepository eventRepository;
    private final EventService eventService;

    public DatabaseInitializer(EventRepository eventRepository, EventService eventService) {
        this.eventRepository = eventRepository;
        this.eventService = eventService;
    }

    @Override
    public void run(String... args) {
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

