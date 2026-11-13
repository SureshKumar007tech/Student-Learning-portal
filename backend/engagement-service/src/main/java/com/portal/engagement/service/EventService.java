package com.portal.engagement.service;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.EventResponse;

import java.util.List;

public interface EventService {
    List<EventResponse> getAllEvents();
    EventResponse getEventById(Long id);
    EventResponse createEvent(CreateEventRequest request);
    void registerForEvent(EventRegistrationRequest request);
}

