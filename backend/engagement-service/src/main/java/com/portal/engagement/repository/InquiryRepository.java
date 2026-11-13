package com.portal.engagement.repository;

import com.portal.engagement.entity.Inquiry;
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
public class InquiryRepository {

    private final JdbcClient jdbcClient;

    public InquiryRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<Inquiry> inquiryRowMapper = new RowMapper<>() {
        @Override
        public Inquiry mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp createdTs = rs.getTimestamp("created_at");
            Timestamp resolvedTs = rs.getTimestamp("resolved_at");
            return new Inquiry(
                rs.getLong("id"),
                rs.getString("name"),
                rs.getString("email"),
                rs.getString("message"),
                rs.getString("status"),
                createdTs != null ? createdTs.toLocalDateTime() : null,
                resolvedTs != null ? resolvedTs.toLocalDateTime() : null
            );
        }
    };

    public List<Inquiry> findAll() {
        return jdbcClient.sql("SELECT * FROM inquiries ORDER BY id DESC")
                .query(inquiryRowMapper)
                .list();
    }

    public Optional<Inquiry> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM inquiries WHERE id = :id")
                .param("id", id)
                .query(inquiryRowMapper)
                .optional();
    }

    public Inquiry save(Inquiry inquiry) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO inquiries (name, email, message, status, created_at) " +
                     "VALUES (:name, :email, :message, :status, :createdAt)";

        LocalDateTime now = LocalDateTime.now();
        inquiry.setCreatedAt(now);

        jdbcClient.sql(sql)
                .param("name", inquiry.getName())
                .param("email", inquiry.getEmail())
                .param("message", inquiry.getMessage())
                .param("status", inquiry.getStatus())
                .param("createdAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            inquiry.setId(key.longValue());
        }
        return inquiry;
    }

    public void updateStatus(Long id, String status, LocalDateTime resolvedAt) {
        jdbcClient.sql("UPDATE inquiries SET status = :status, resolved_at = :resolvedAt WHERE id = :id")
                .param("status", status)
                .param("resolvedAt", resolvedAt != null ? Timestamp.valueOf(resolvedAt) : null)
                .param("id", id)
                .update();
    }
}

