package com.portal.engagement.service.impl;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.EventResponse;
import com.portal.engagement.entity.AcademicEvent;
import com.portal.engagement.entity.EventRegistration;
import com.portal.engagement.exception.DuplicateResourceException;
import com.portal.engagement.exception.ResourceNotFoundException;
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
        AcademicEvent event = new AcademicEvent();
        event.setTitle(request.getTitle().trim());
        event.setEventDate(request.getEventDate().trim());
        event.setVenue(request.getVenue().trim());
        event.setDescription(request.getDescription());
        event.setOrganizer(request.getOrganizer());
        event.setCapacity(request.getCapacity());
        event.setActive(true);

        AcademicEvent saved = eventRepository.save(event);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void registerForEvent(EventRegistrationRequest request) {
        AcademicEvent event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found with id: " + request.getEventId()));

        registrationRepository.findByEventIdAndStudentId(request.getEventId(), request.getStudentId())
                .ifPresent(existing -> {
                    throw new DuplicateResourceException("Already registered for event: " + event.getTitle());
                });

        EventRegistration reg = new EventRegistration();
        reg.setEventId(request.getEventId());
        reg.setStudentId(request.getStudentId());
        reg.setStudentName(request.getStudentName());
        reg.setStudentEmail(request.getStudentEmail());
        reg.setStatus("CONFIRMED");

        registrationRepository.save(reg);
    }

    private EventResponse toResponse(AcademicEvent e) {
        return new EventResponse(
                e.getId(),
                e.getTitle(),
                e.getEventDate(),
                e.getVenue(),
                e.getDescription(),
                e.getOrganizer(),
                e.getCapacity(),
                e.isActive(),
                e.getCreatedAt()
        );
    }
}

