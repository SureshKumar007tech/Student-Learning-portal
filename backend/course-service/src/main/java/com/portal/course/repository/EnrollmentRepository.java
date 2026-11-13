package com.portal.course.repository;

import com.portal.course.entity.Enrollment;
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
public class EnrollmentRepository {

    private final JdbcClient jdbcClient;

    public EnrollmentRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<Enrollment> enrollmentRowMapper = new RowMapper<>() {
        @Override
        public Enrollment mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp enrolledTs = rs.getTimestamp("enrolled_at");
            Timestamp completedTs = rs.getTimestamp("completed_at");
            return new Enrollment(
                rs.getLong("id"),
                rs.getLong("course_id"),
                rs.getLong("student_id"),
                rs.getString("status"),
                rs.getInt("progress_percent"),
                enrolledTs != null ? enrolledTs.toLocalDateTime() : null,
                completedTs != null ? completedTs.toLocalDateTime() : null
            );
        }
    };

    public List<Enrollment> findByStudentId(Long studentId) {
        return jdbcClient.sql("SELECT * FROM enrollments WHERE student_id = :studentId ORDER BY id DESC")
                .param("studentId", studentId)
                .query(enrollmentRowMapper)
                .list();
    }

    public Optional<Enrollment> findByStudentIdAndCourseId(Long studentId, Long courseId) {
        return jdbcClient.sql("SELECT * FROM enrollments WHERE student_id = :studentId AND course_id = :courseId")
                .param("studentId", studentId)
                .param("courseId", courseId)
                .query(enrollmentRowMapper)
                .optional();
    }

    public Optional<Enrollment> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM enrollments WHERE id = :id")
                .param("id", id)
                .query(enrollmentRowMapper)
                .optional();
    }

    public Enrollment save(Enrollment enrollment) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO enrollments (course_id, student_id, status, progress_percent, enrolled_at) " +
                     "VALUES (:courseId, :studentId, :status, :progressPercent, :enrolledAt)";

        LocalDateTime now = LocalDateTime.now();
        enrollment.setEnrolledAt(now);

        jdbcClient.sql(sql)
                .param("courseId", enrollment.getCourseId())
                .param("studentId", enrollment.getStudentId())
                .param("status", enrollment.getStatus())
                .param("progressPercent", enrollment.getProgressPercent())
                .param("enrolledAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            enrollment.setId(key.longValue());
        }
        return enrollment;
    }

    public void updateProgress(Long id, int progressPercent, String status, LocalDateTime completedAt) {
        jdbcClient.sql("UPDATE enrollments SET progress_percent = :progressPercent, status = :status, completed_at = :completedAt WHERE id = :id")
                .param("progressPercent", progressPercent)
                .param("status", status)
                .param("completedAt", completedAt != null ? Timestamp.valueOf(completedAt) : null)
                .param("id", id)
                .update();
    }
}

