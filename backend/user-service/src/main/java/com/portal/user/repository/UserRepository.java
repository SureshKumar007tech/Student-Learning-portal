package com.portal.user.repository;

import com.portal.user.entity.User;
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
public class UserRepository {

    private final JdbcClient jdbcClient;

    public UserRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<User> userRowMapper = new RowMapper<>() {
        @Override
        public User mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp createdTs = rs.getTimestamp("created_at");
            Timestamp updatedTs = rs.getTimestamp("updated_at");
            return new User(
                rs.getLong("id"),
                rs.getString("username"),
                rs.getString("email"),
                rs.getString("password_hash"),
                rs.getString("first_name"),
                rs.getString("last_name"),
                rs.getString("role"),
                createdTs != null ? createdTs.toLocalDateTime() : null,
                updatedTs != null ? updatedTs.toLocalDateTime() : null
            );
        }
    };

    public Optional<User> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM users WHERE id = :id")
                .param("id", id)
                .query(userRowMapper)
                .optional();
    }

    public Optional<User> findByUsername(String username) {
        return jdbcClient.sql("SELECT * FROM users WHERE LOWER(username) = LOWER(:username)")
                .param("username", username)
                .query(userRowMapper)
                .optional();
    }

    public Optional<User> findByEmail(String email) {
        return jdbcClient.sql("SELECT * FROM users WHERE LOWER(email) = LOWER(:email)")
                .param("email", email)
                .query(userRowMapper)
                .optional();
    }

    public boolean existsByUsername(String username) {
        Integer count = jdbcClient.sql("SELECT COUNT(*) FROM users WHERE LOWER(username) = LOWER(:username)")
                .param("username", username)
                .query(Integer.class)
                .single();
        return count != null && count > 0;
    }

    public boolean existsByEmail(String email) {
        Integer count = jdbcClient.sql("SELECT COUNT(*) FROM users WHERE LOWER(email) = LOWER(:email)")
                .param("email", email)
                .query(Integer.class)
                .single();
        return count != null && count > 0;
    }

    public User save(User user) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO users (username, email, password_hash, first_name, last_name, role, created_at, updated_at) " +
                     "VALUES (:username, :email, :passwordHash, :firstName, :lastName, :role, :createdAt, :updatedAt)";

        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        jdbcClient.sql(sql)
                .param("username", user.getUsername())
                .param("email", user.getEmail())
                .param("passwordHash", user.getPasswordHash())
                .param("firstName", user.getFirstName())
                .param("lastName", user.getLastName())
                .param("role", user.getRole())
                .param("createdAt", Timestamp.valueOf(now))
                .param("updatedAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            user.setId(key.longValue());
        }
        return user;
    }

    public void update(User user) {
        LocalDateTime now = LocalDateTime.now();
        user.setUpdatedAt(now);
        jdbcClient.sql("UPDATE users SET first_name = :firstName, last_name = :lastName, role = :role, updated_at = :updatedAt WHERE id = :id")
                .param("firstName", user.getFirstName())
                .param("lastName", user.getLastName())
                .param("role", user.getRole())
                .param("updatedAt", Timestamp.valueOf(now))
                .param("id", user.getId())
                .update();
    }

    public List<User> findAll() {
        return jdbcClient.sql("SELECT * FROM users ORDER BY id ASC")
                .query(userRowMapper)
                .list();
    }
}

