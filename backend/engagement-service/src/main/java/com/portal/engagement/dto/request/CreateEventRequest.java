package com.portal.engagement.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CreateEventRequest {
    @NotBlank(message = "Title is required")
    @Size(min = 2, max = 150)
    private String title;

    @NotBlank(message = "Event date is required (e.g. 20 October)")
    private String eventDate;

    @NotBlank(message = "Venue is required (e.g. Seminar Hall)")
    private String venue;

    private String description;
    private String organizer;
    private int capacity = 100;

    public CreateEventRequest() {}

    public CreateEventRequest(String title, String eventDate, String venue, String description, String organizer, int capacity) {
        this.title = title;
        this.eventDate = eventDate;
        this.venue = venue;
        this.description = description;
        this.organizer = organizer;
        this.capacity = capacity;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getEventDate() { return eventDate; }
    public void setEventDate(String eventDate) { this.eventDate = eventDate; }

    public String getVenue() { return venue; }
    public void setVenue(String venue) { this.venue = venue; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getOrganizer() { return organizer; }
    public void setOrganizer(String organizer) { this.organizer = organizer; }

    public int getCapacity() { return capacity; }
    public void setCapacity(int capacity) { this.capacity = capacity; }
}

