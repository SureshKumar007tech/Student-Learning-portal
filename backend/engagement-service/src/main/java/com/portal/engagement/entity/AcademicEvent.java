package com.portal.engagement.entity;

import java.time.LocalDateTime;

public class AcademicEvent {
    private Long id;
    private String title;
    private String eventDate;
    private String venue;
    private String description;
    private String organizer;
    private int capacity;
    private boolean isActive;
    private LocalDateTime createdAt;

    public AcademicEvent() {}

    public AcademicEvent(Long id, String title, String eventDate, String venue, String description, String organizer, int capacity, boolean isActive, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.eventDate = eventDate;
        this.venue = venue;
        this.description = description;
        this.organizer = organizer;
        this.capacity = capacity;
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

    public boolean isActive() { return isActive; }
    public void setActive(boolean active) { isActive = active; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}

