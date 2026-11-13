package com.portal.engagement.service;

import com.portal.engagement.dto.request.CreateEventRequest;
import com.portal.engagement.dto.request.EventRegistrationRequest;
import com.portal.engagement.dto.response.EventResponse;
import com.portal.engagement.entity.AcademicEvent;
import com.portal.engagement.entity.EventRegistration;
import com.portal.engagement.exception.DuplicateResourceException;
import com.portal.engagement.exception.ResourceNotFoundException;
import com.portal.engagement.repository.EventRegistrationRepository;
import com.portal.engagement.repository.EventRepository;
import com.portal.engagement.service.impl.EventServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class EventServiceTest {

    @Mock
    private EventRepository eventRepository;

    @Mock
    private EventRegistrationRepository registrationRepository;

    private EventServiceImpl eventService;

    @BeforeEach
    void setUp() {
        eventService = new EventServiceImpl(eventRepository, registrationRepository);
    }

    @Test
    void getAllEvents_ShouldReturnEvents() {
        AcademicEvent e1 = new AcademicEvent();
        e1.setId(1L);
        e1.setTitle("Web Workshop");
        e1.setEventDate("20 October");
        e1.setVenue("Seminar Hall");

        when(eventRepository.findAll()).thenReturn(List.of(e1));

        List<EventResponse> list = eventService.getAllEvents();

        assertThat(list).hasSize(1);
        assertThat(list.get(0).getTitle()).isEqualTo("Web Workshop");
    }

    @Test
    void registerForEvent_WhenValid_ShouldSaveRegistration() {
        AcademicEvent event = new AcademicEvent();
        event.setId(1L);
        event.setTitle("Web Workshop");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(1L, 10L)).thenReturn(Optional.empty());

        EventRegistrationRequest request = new EventRegistrationRequest(1L, 10L, "Student Name", "student@test.com");
        eventService.registerForEvent(request);

        verify(registrationRepository).save(any(EventRegistration.class));
    }

    @Test
    void registerForEvent_WhenAlreadyRegistered_ShouldThrowDuplicateException() {
        AcademicEvent event = new AcademicEvent();
        event.setId(1L);
        event.setTitle("Web Workshop");

        when(eventRepository.findById(1L)).thenReturn(Optional.of(event));
        when(registrationRepository.findByEventIdAndStudentId(1L, 10L)).thenReturn(Optional.of(new EventRegistration()));

        EventRegistrationRequest request = new EventRegistrationRequest(1L, 10L, "Student Name", "student@test.com");

        assertThatThrownBy(() -> eventService.registerForEvent(request))
                .isInstanceOf(DuplicateResourceException.class)
                .hasMessageContaining("Already registered");
    }

    @Test
    void getEventById_WhenNotFound_ShouldThrowException() {
        when(eventRepository.findById(99L)).thenReturn(Optional.empty());

        assertThatThrownBy(() -> eventService.getEventById(99L))
                .isInstanceOf(ResourceNotFoundException.class);
    }
}

