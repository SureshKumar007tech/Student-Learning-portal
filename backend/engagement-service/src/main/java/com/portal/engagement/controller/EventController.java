package com.portal.engagement.controller;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.ApiResponse;
import com.portal.engagement.dto.response.EventResponse;
import com.portal.engagement.service.EventService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/events")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<EventResponse>>> getAllEvents() {
        List<EventResponse> events = eventService.getAllEvents();
        return ResponseEntity.ok(ApiResponse.ok("Events retrieved successfully", events));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EventResponse>> getEventById(@PathVariable Long id) {
        EventResponse event = eventService.getEventById(id);
        return ResponseEntity.ok(ApiResponse.ok("Event retrieved successfully", event));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<EventResponse>> createEvent(@Valid @RequestBody CreateEventRequest request) {
        EventResponse event = eventService.createEvent(request);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.ok("Event created successfully", event));
    }

    @PostMapping("/{id}/register")
    public ResponseEntity<ApiResponse<Void>> registerForEvent(
            @PathVariable Long id,
            @RequestBody EventRegistrationRequest request) {
        request.setEventId(id);
        eventService.registerForEvent(request);
        return ResponseEntity.ok(ApiResponse.ok("Registered for event successfully", null));
    }
}

