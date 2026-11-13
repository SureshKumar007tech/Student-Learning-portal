package com.portal.engagement.repository;

import com.portal.engagement.entity.AcademicEvent;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public class EventRepository {

    private final JdbcClient jdbcClient;

    public EventRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<AcademicEvent> eventRowMapper = new RowMapper<>() {
        @Override
        public AcademicEvent mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp createdTs = rs.getTimestamp("created_at");
            return new AcademicEvent(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("event_date"),
                rs.getString("venue"),
                rs.getString("description"),
                rs.getString("organizer"),
                rs.getInt("capacity"),
                rs.getBoolean("is_active"),
                createdTs != null ? createdTs.toLocalDateTime() : null
            );
        }
    };

    public List<AcademicEvent> findAll() {
        return jdbcClient.sql("SELECT * FROM events WHERE is_active = TRUE ORDER BY id ASC")
                .query(eventRowMapper)
                .list();
    }

    public Optional<AcademicEvent> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM events WHERE id = :id")
                .param("id", id)
                .query(eventRowMapper)
                .optional();
    }

    public AcademicEvent save(AcademicEvent event) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO events (title, event_date, venue, description, organizer, capacity, is_active, created_at) " +
                     "VALUES (:title, :eventDate, :venue, :description, :organizer, :capacity, :isActive, :createdAt)";

        LocalDateTime now = LocalDateTime.now();
        event.setCreatedAt(now);

        jdbcClient.sql(sql)
                .param("title", event.getTitle())
                .param("eventDate", event.getEventDate())
                .param("venue", event.getVenue())
                .param("description", event.getDescription())
                .param("organizer", event.getOrganizer())
                .param("capacity", event.getCapacity())
                .param("isActive", event.isActive())
                .param("createdAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            event.setId(key.longValue());
        }
        return event;
    }
}

