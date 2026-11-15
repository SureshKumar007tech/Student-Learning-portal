package com.portal.engagement.service;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.EventResponse;
import com.portal.engagement.entity.EventRegistration;

import java.util.List;

public interface EventService {
    List<EventResponse> getAllEvents();
    EventResponse getEventById(Long id);
    EventResponse createEvent(CreateEventRequest request);
    EventResponse createEvent(CreateEventRequest request, String xUserRole);
    void registerForEvent(EventRegistrationRequest request, String xUserId, String xUserName, String xUserEmail, String xUserRole);
    List<EventRegistration> getMyRegistrations(String xUserId);
    void cancelRegistration(Long eventId, String xUserId, String xUserRole);
}
