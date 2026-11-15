package com.portal.engagement.service.impl;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.EventResponse;
import com.portal.engagement.entity.AcademicEvent;
import com.portal.engagement.entity.EventRegistration;
import com.portal.engagement.exception.BadRequestException;
import com.portal.engagement.exception.DuplicateResourceException;
import com.portal.engagement.exception.ForbiddenException;
import com.portal.engagement.exception.ResourceNotFoundException;
import com.portal.engagement.exception.UnauthorizedException;
import com.portal.engagement.repository.EventRegistrationRepository;
import com.portal.engagement.repository.EventRepository;
import com.portal.engagement.service.EventService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    public EventServiceImpl(EventRepository eventRepository, EventRegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @Override
    public List<EventResponse> getAllEvents() {
        return eventRepository.findAll().stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    public EventResponse getEventById(Long id) {
        AcademicEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + id));
        return toResponse(event);
    }

    @Override
    public EventResponse createEvent(CreateEventRequest request) {
        return createEvent(request, "ROLE_ADMIN");
    }

    @Override
    public EventResponse createEvent(CreateEventRequest request, String xUserRole) {
        if (!"ROLE_ADMIN".equals(xUserRole)) {
            throw new ForbiddenException("Access denied: Only administrators can create events");
        }

        AcademicEvent event = new AcademicEvent();
        event.setTitle(request.getTitle().trim());
        event.setEventDate(request.getEventDate().trim());
        event.setVenue(request.getVenue().trim());
        event.setDescription(request.getDescription());
        event.setOrganizer(request.getOrganizer());
        event.setCapacity(request.getCapacity() > 0 ? request.getCapacity() : 100);
        event.setActive(true);

        AcademicEvent saved = eventRepository.save(event);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void registerForEvent(EventRegistrationRequest request, String xUserId, String xUserName, String xUserEmail, String xUserRole) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required to register for events");
        }

        Long verifiedStudentId;
        if ("ROLE_ADMIN".equals(xUserRole) && request.getStudentId() != null) {
            verifiedStudentId = request.getStudentId();
        } else {
            try {
                verifiedStudentId = Long.parseLong(xUserId.trim());
            } catch (NumberFormatException e) {
                throw new UnauthorizedException("Invalid authenticated user identity");
            }
        }

        AcademicEvent event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        if (!event.isActive()) {
            throw new BadRequestException("Event is no longer active for registration");
        }

        // Capacity check
        int currentCount = registrationRepository.countByEventId(request.getEventId());
        if (currentCount >= event.getCapacity()) {
            throw new BadRequestException("Event has reached maximum capacity (" + event.getCapacity() + " seats)");
        }

        // Duplicate registration check
        registrationRepository.findByEventIdAndStudentId(request.getEventId(), verifiedStudentId)
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Already registered for event: " + event.getTitle());
                });

        String finalName = (xUserName != null && !xUserName.isBlank()) ? xUserName : request.getStudentName();
        String finalEmail = (xUserEmail != null && !xUserEmail.isBlank()) ? xUserEmail : request.getStudentEmail();

        EventRegistration reg = new EventRegistration();
        reg.setEventId(request.getEventId());
        reg.setStudentId(verifiedStudentId);
        reg.setStudentName(finalName);
        reg.setStudentEmail(finalEmail);
        reg.setStatus("CONFIRMED");

        registrationRepository.save(reg);
    }

    @Override
    public List<EventRegistration> getMyRegistrations(String xUserId) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
        Long studentId;
        try {
            studentId = Long.parseLong(xUserId.trim());
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Invalid authenticated user identity");
        }
        return registrationRepository.findByStudentId(studentId);
    }

    @Override
    @Transactional
    public void cancelRegistration(Long eventId, String xUserId, String xUserRole) {
        if (xUserId == null || xUserId.isBlank()) {
            throw new UnauthorizedException("Authentication required");
        }
        Long studentId;
        try {
            studentId = Long.parseLong(xUserId.trim());
        } catch (NumberFormatException e) {
            throw new UnauthorizedException("Invalid authenticated user identity");
        }

        EventRegistration reg = registrationRepository.findByEventIdAndStudentId(eventId, studentId)
                .orElseThrow(() -> new ResourceNotFoundException("No active registration found for event id: " + eventId));

        if (!"ROLE_ADMIN".equals(xUserRole) && !reg.getStudentId().equals(studentId)) {
            throw new ForbiddenException("Access denied: You cannot cancel another student's registration");
        }

        registrationRepository.deleteByEventIdAndStudentId(eventId, studentId);
    }

    private EventResponse toResponse(AcademicEvent e) {
        int registeredCount = 0;
        try {
            registeredCount = registrationRepository.countByEventId(e.getId());
        } catch (Exception ignored) {}

        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getEventDate(),
                e.getVenue(),
                e.getDescription(),
                e.getOrganizer(),
                e.getCapacity(),
                registeredCount,
                e.isActive(),
                e.getCreatedAt()
        );
    }
}
