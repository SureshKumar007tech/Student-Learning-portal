package com.portal.engagement.service;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.EventResponse;
import com.portal.engagement.entity.AcademicEvent;
import com.portal.engagement.entity.EventRegistration;
import com.portal.engagement.exception.BadRequestException;
import com.portal.engagement.exception.DuplicateResourceException;
import com.portal.engagement.exception.ForbiddenException;
import com.portal.engagement.exception.ResourceNotFoundException;
import com.portal.engagement.repository.EventRegistrationRepository;
import com.portal.engagement.repository.EventRepository;
import com.portal.engagement.service.impl.EventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

class EventServiceTest {

    private EventRepositoryStub eventRepository;
    private EventRegistrationRepositoryStub registrationRepository;
    private EventServiceImpl eventService;

    static class EventRepositoryStub extends EventRepository {
        Map<Long, AcademicEvent> events = new HashMap<>();
        long nextId = 1L;

        public EventRepositoryStub() {
            super(null);
        }

        @Override
        public List<AcademicEvent> findAll() {
            return new ArrayList<>(events.values());
        }

        @Override
        public Optional<AcademicEvent> findById(Long id) {
            return Optional.ofNullable(events.get(id));
        }

        @Override
        public AcademicEvent save(AcademicEvent event) {
            if (event.getId() == null) {
                event.setId(nextId++);
            }
            events.put(event.getId(), event);
            return event;
        }
    }

    static class EventRegistrationRepositoryStub extends EventRegistrationRepository {
        Map<Long, EventRegistration> registrations = new HashMap<>();
        long nextId = 1L;

        public EventRegistrationRepositoryStub() {
            super(null);
        }

        @Override
        public Optional<EventRegistration> findByEventIdAndStudentId(Long eventId, Long studentId) {
            return registrations.values().stream()
                    .filter(r -> Objects.equals(r.getEventId(), eventId) && Objects.equals(r.getStudentId(), studentId))
                    .findFirst();
        }

        @Override
        public List<EventRegistration> findByStudentId(Long studentId) {
            List<EventRegistration> list = new ArrayList<>();
            for (EventRegistration r : registrations.values()) {
                if (Objects.equals(r.getStudentId(), studentId)) {
                    list.add(r);
                }
            }
            return list;
        }

        @Override
        public int countByEventId(Long eventId) {
            return (int) registrations.values().stream()
                    .filter(r -> Objects.equals(r.getEventId(), eventId) && "CONFIRMED".equals(r.getStatus()))
                    .count();
        }

        @Override
        public int deleteByEventIdAndStudentId(Long eventId, Long studentId) {
            boolean removed = registrations.values().removeIf(r -> Objects.equals(r.getEventId(), eventId) && Objects.equals(r.getStudentId(), studentId));
            return removed ? 1 : 0;
        }

        @Override
        public EventRegistration save(EventRegistration reg) {
            if (reg.getId() == null) {
                reg.setId(nextId++);
            }
            registrations.put(reg.getId(), reg);
            return reg;
        }
    }

    @BeforeEach
    void setUp() {
        eventRepository = new EventRepositoryStub();
        registrationRepository = new EventRegistrationRepositoryStub();
        eventService = new EventServiceImpl(eventRepository, registrationRepository);
    }

    @Test
    void getAllEvents_ShouldReturnEventsWithRegisteredCounts() {
        AcademicEvent e1 = new AcademicEvent();
        e1.setId(1L);
        e1.setTitle("Web Workshop");
        e1.setEventDate("2026-11-20T10:00:00Z");
        e1.setVenue("Seminar Hall");
        e1.setCapacity(50);
        e1.setActive(true);
        eventRepository.events.put(1L, e1);

        EventRegistration reg = new EventRegistration();
        reg.setEventId(1L);
        reg.setStudentId(10L);
        reg.setStatus("CONFIRMED");
        registrationRepository.save(reg);

        List<EventResponse> list = eventService.getAllEvents();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getTitle()).isEqualTo("Web Workshop");
        assertThat(list.get(0).getRegisteredCount()).isEqualTo(1);
    }

    @Test
    void createEvent_WhenStudentRole_ShouldThrowForbidden() {
        CreateEventRequest req = new CreateEventRequest();
        req.setTitle("Hackathon");
        req.setEventDate("2026-12-01T09:00:00Z");
        req.setVenue("Auditorium");
        req.setCapacity(100);

        assertThatThrownBy(() -> eventService.createEvent(req, "ROLE_STUDENT"))
                .isInstanceOf(ForbiddenException.class)
                .hasMessageContaining("Access denied");
    }

    @Test
    void registerForEvent_WhenStudentRole_ShouldDeriveIdentityFromContext() {
        AcademicEvent event = new AcademicEvent();
        event.setId(1L);
        event.setTitle("Web Workshop");
        event.setCapacity(10);
        event.setActive(true);
        eventRepository.events.put(1L, event);

        EventRegistrationRequest request = new EventRegistrationRequest();
        request.setEventId(1L);
        request.setStudentId(999L); // Spoofed ID in body

        eventService.registerForEvent(request, "5", "verified_student", "student@test.com", "ROLE_STUDENT");

        Optional<EventRegistration> saved = registrationRepository.findByEventIdAndStudentId(1L, 5L);
        assertThat(saved).isPresent();
        assertThat(saved.get().getStudentName()).isEqualTo("verified_student");
    }

    @Test
    void registerForEvent_WhenCapacityReached_ShouldThrowBadRequest() {
        AcademicEvent event = new AcademicEvent();
        event.setId(1L);
        event.setTitle("Small Seminar");
        event.setCapacity(1);
        event.setActive(true);
        eventRepository.events.put(1L, event);

        // Pre-fill capacity
        EventRegistration existingReg = new EventRegistration();
        existingReg.setEventId(1L);
        existingReg.setStudentId(2L);
        existingReg.setStatus("CONFIRMED");
        registrationRepository.save(existingReg);

        EventRegistrationRequest request = new EventRegistrationRequest();
        request.setEventId(1L);

        assertThatThrownBy(() -> eventService.registerForEvent(request, "3", "student3", "s3@test.com", "ROLE_STUDENT"))
                .isInstanceOf(BadRequestException.class)
                .hasMessageContaining("maximum capacity");
    }

    @Test
    void registerForEvent_WhenAlreadyRegistered_ShouldThrowDuplicateException() {
        AcademicEvent event = new AcademicEvent();
        event.setId(1L);
        event.setTitle("Web Workshop");
        event.setCapacity(10);
        event.setActive(true);
        eventRepository.events.put(1L, event);

        EventRegistration existing = new EventRegistration();
        existing.setEventId(1L);
        existing.setStudentId(10L);
        existing.setStatus("CONFIRMED");
        registrationRepository.save(existing);

        EventRegistrationRequest request = new EventRegistrationRequest();
        request.setEventId(1L);

        assertThatThrownBy(() -> eventService.registerForEvent(request, "10", "student10", "s10@test.com", "ROLE_STUDENT"))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Already registered");
    }

    @Test
    void cancelRegistration_WhenOwnerStudent_ShouldSucceed() {
        AcademicEvent event = new AcademicEvent();
        event.setId(1L);
        eventRepository.events.put(1L, event);

        EventRegistration reg = new EventRegistration();
        reg.setEventId(1L);
        reg.setStudentId(7L);
        reg.setStatus("CONFIRMED");
        registrationRepository.save(reg);

        eventService.cancelRegistration(1L, "7", "ROLE_STUDENT");

        assertThat(registrationRepository.findByEventIdAndStudentId(1L, 7L)).isEmpty();
    }
}
