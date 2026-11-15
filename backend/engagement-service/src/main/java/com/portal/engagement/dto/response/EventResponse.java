package com.portal.engagement.dto.response;

import java.time.LocalDateTime;

public class EventResponse {
    private Long id;
    private String title;
    private String eventDate;
    private String venue;
    private String description;
    private String organizer;
    private int capacity;
    private int registeredCount;
    private boolean isActive;
    private LocalDateTime createdAt;

    public EventResponse() {}

    public EventResponse(Long id, String title, String eventDate, String venue, String description, String organizer, int capacity, int registeredCount, boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.eventDate = eventDate;
        this.venue = venue;
        this.description = description;
        this.organizer = organizer;
        this.capacity = capacity;
        this.registeredCount = registeredCount;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

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

    public int getRegisteredCount() { return registeredCount; }
    public void setRegisteredCount(int registeredCount) { this.registeredCount = registeredCount; }

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}
