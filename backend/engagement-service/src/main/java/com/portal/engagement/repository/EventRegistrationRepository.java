package com.portal.engagement.repository;

import com.portal.engagement.entity.EventRegistration;
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
public class EventRegistrationRepository {

    private final JdbcClient jdbcClient;

    public EventRegistrationRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<EventRegistration> regRowMapper = new RowMapper<>() {
        @Override
        public EventRegistration mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp regTs = rs.getTimestamp("registered_at");
            return new EventRegistration(
                rs.getLong("id"),
                rs.getLong("event_id"),
                rs.getLong("student_id"),
                rs.getString("student_name"),
                rs.getString("student_email"),
                rs.getString("status"),
                regTs != null ? regTs.toLocalDateTime() : null
            );
        }
    };

    public Optional<EventRegistration> findByEventIdAndStudentId(Long eventId, Long studentId) {
        return jdbcClient.sql("SELECT * FROM event_registrations WHERE event_id = :eventId AND student_id = :studentId")
                .param("eventId", eventId)
                .param("studentId", studentId)
                .query(regRowMapper)
                .optional();
    }

    public List<EventRegistration> findByStudentId(Long studentId) {
        return jdbcClient.sql("SELECT * FROM event_registrations WHERE student_id = :studentId ORDER BY id DESC")
                .param("studentId", studentId)
                .query(regRowMapper)
                .list();
    }

    public EventRegistration save(EventRegistration reg) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO event_registrations (event_id, student_id, student_name, student_email, status, registered_at) " +
                     "VALUES (:eventId, :studentId, :studentName, :studentEmail, :status, :registeredAt)";

        LocalDateTime now = LocalDateTime.now();
        reg.setRegisteredAt(now);

        jdbcClient.sql(sql)
                .param("eventId", reg.getEventId())
                .param("studentId", reg.getStudentId())
                .param("studentName", reg.getStudentName())
                .param("studentEmail", reg.getStudentEmail())
                .param("status", reg.getStatus())
                .param("registeredAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            reg.setId(key.longValue());
        }
        return reg;
    }
}

