package com.portal.user.repository;

import com.portal.user.entity.StudentProfile;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public class StudentProfileRepository {

    private final JdbcClient jdbcClient;

    public StudentProfileRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<StudentProfile> profileRowMapper = new RowMapper<>() {
        @Override
        public StudentProfile mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp lastLoginTs = rs.getTimestamp("last_login");
            Timestamp createdTs = rs.getTimestamp("created_at");
            Timestamp updatedTs = rs.getTimestamp("updated_at");

            return new StudentProfile(
                rs.getLong("id"),
                rs.getLong("user_id"),
                rs.getString("bio"),
                rs.getString("avatar_url"),
                rs.getInt("visits_count"),
                rs.getString("learning_goals"),
                lastLoginTs != null ? lastLoginTs.toLocalDateTime() : null,
                createdTs != null ? createdTs.toLocalDateTime() : null,
                updatedTs != null ? updatedTs.toLocalDateTime() : null
            );
        }
    };

    public Optional<StudentProfile> findByUserId(Long userId) {
        return jdbcClient.sql("SELECT * FROM student_profiles WHERE user_id = :userId")
                .param("userId", userId)
                .query(profileRowMapper)
                .optional();
    }

    public StudentProfile save(StudentProfile profile) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO student_profiles (user_id, bio, avatar_url, visits_count, learning_goals, last_login, created_at, updated_at) " +
                     "VALUES (:userId, :bio, :avatarUrl, :visitsCount, :learningGoals, :lastLogin, :createdAt, :updatedAt)";

        LocalDateTime now = LocalDateTime.now();
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);

        jdbcClient.sql(sql)
                .param("userId", profile.getUserId())
                .param("bio", profile.getBio())
                .param("avatarUrl", profile.getAvatarUrl())
                .param("visitsCount", profile.getVisitsCount())
                .param("learningGoals", profile.getLearningGoals())
                .param("lastLogin", profile.getLastLogin() != null ? Timestamp.valueOf(profile.getLastLogin()) : null)
                .param("createdAt", Timestamp.valueOf(now))
                .param("updatedAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            profile.setId(key.longValue());
        }
        return profile;
    }

    public void update(StudentProfile profile) {
        LocalDateTime now = LocalDateTime.now();
        profile.setUpdatedAt(now);
        jdbcClient.sql("UPDATE student_profiles SET bio = :bio, avatar_url = :avatarUrl, visits_count = :visitsCount, " +
                       "learning_goals = :learningGoals, last_login = :lastLogin, updated_at = :updatedAt WHERE user_id = :userId")
                .param("bio", profile.getBio())
                .param("avatarUrl", profile.getAvatarUrl())
                .param("visitsCount", profile.getVisitsCount())
                .param("learningGoals", profile.getLearningGoals())
                .param("lastLogin", profile.getLastLogin() != null ? Timestamp.valueOf(profile.getLastLogin()) : null)
                .param("updatedAt", Timestamp.valueOf(now))
                .param("userId", profile.getUserId())
                .update();
    }

    public void incrementVisits(Long userId) {
        jdbcClient.sql("UPDATE student_profiles SET visits_count = visits_count + 1, updated_at = :updatedAt WHERE user_id = :userId")
                .param("updatedAt", Timestamp.valueOf(LocalDateTime.now()))
                .param("userId", userId)
                .update();
    }
}

