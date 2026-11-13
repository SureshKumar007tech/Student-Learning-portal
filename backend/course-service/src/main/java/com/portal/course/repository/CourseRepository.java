package com.portal.course.repository;

import com.portal.course.entity.Course;
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
public class CourseRepository {

    private final JdbcClient jdbcClient;

    public CourseRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<Course> courseRowMapper = new RowMapper<>() {
        @Override
        public Course mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp createdTs = rs.getTimestamp("created_at");
            return new Course(
                rs.getLong("id"),
                rs.getString("code"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("level"),
                rs.getObject("instructor_id") != null ? rs.getLong("instructor_id") : null,
                rs.getInt("duration_hours"),
                rs.getBoolean("is_active"),
                createdTs != null ? createdTs.toLocalDateTime() : null
            );
        }
    };

    public List<Course> findAll() {
        return jdbcClient.sql("SELECT * FROM courses WHERE is_active = TRUE ORDER BY id ASC")
                .query(courseRowMapper)
                .list();
    }

    public List<Course> findByLevel(String level) {
        return jdbcClient.sql("SELECT * FROM courses WHERE LOWER(level) = LOWER(:level) AND is_active = TRUE ORDER BY id ASC")
                .param("level", level)
                .query(courseRowMapper)
                .list();
    }

    public Optional<Course> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM courses WHERE id = :id")
                .param("id", id)
                .query(courseRowMapper)
                .optional();
    }

    public boolean existsByCode(String code) {
        Integer count = jdbcClient.sql("SELECT COUNT(*) FROM courses WHERE LOWER(code) = LOWER(:code)")
                .param("code", code)
                .query(Integer.class)
                .single();
        return count != null && count > 0;
    }

    public Course save(Course course) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO courses (code, title, description, level, instructor_id, duration_hours, is_active, created_at) " +
                     "VALUES (:code, :title, :description, :level, :instructorId, :durationHours, :isActive, :createdAt)";

        LocalDateTime now = LocalDateTime.now();
        course.setCreatedAt(now);

        jdbcClient.sql(sql)
                .param("code", course.getCode())
                .param("title", course.getTitle())
                .param("description", course.getDescription())
                .param("level", course.getLevel())
                .param("instructorId", course.getInstructorId())
                .param("durationHours", course.getDurationHours())
                .param("isActive", course.isActive())
                .param("createdAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            course.setId(key.longValue());
        }
        return course;
    }
}

