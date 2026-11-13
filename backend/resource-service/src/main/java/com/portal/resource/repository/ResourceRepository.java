package com.portal.resource.repository;

import com.portal.resource.entity.Resource;
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
public class ResourceRepository {

    private final JdbcClient jdbcClient;

    public ResourceRepository(JdbcClient jdbcClient) {
        this.jdbcClient = jdbcClient;
    }

    private final RowMapper<Resource> resourceRowMapper = new RowMapper<>() {
        @Override
        public Resource mapRow(ResultSet rs, int rowNum) throws SQLException {
            Timestamp createdTs = rs.getTimestamp("created_at");
            return new Resource(
                rs.getLong("id"),
                rs.getString("title"),
                rs.getString("description"),
                rs.getString("resource_type"),
                rs.getString("file_url"),
                rs.getObject("course_id_ref") != null ? rs.getLong("course_id_ref") : null,
                rs.getInt("download_count"),
                createdTs != null ? createdTs.toLocalDateTime() : null
            );
        }
    };

    public List<Resource> findAll() {
        return jdbcClient.sql("SELECT * FROM resources ORDER BY id ASC")
                .query(resourceRowMapper)
                .list();
    }

    public List<Resource> findByType(String resourceType) {
        return jdbcClient.sql("SELECT * FROM resources WHERE LOWER(resource_type) = LOWER(:type) ORDER BY id ASC")
                .param("type", resourceType)
                .query(resourceRowMapper)
                .list();
    }

    public Optional<Resource> findById(Long id) {
        return jdbcClient.sql("SELECT * FROM resources WHERE id = :id")
                .param("id", id)
                .query(resourceRowMapper)
                .optional();
    }

    public Resource save(Resource resource) {
        KeyHolder keyHolder = new GeneratedKeyHolder();
        String sql = "INSERT INTO resources (title, description, resource_type, file_url, course_id_ref, download_count, created_at) " +
                     "VALUES (:title, :description, :resourceType, :fileUrl, :courseIdRef, :downloadCount, :createdAt)";

        LocalDateTime now = LocalDateTime.now();
        resource.setCreatedAt(now);

        jdbcClient.sql(sql)
                .param("title", resource.getTitle())
                .param("description", resource.getDescription())
                .param("resourceType", resource.getResourceType())
                .param("fileUrl", resource.getFileUrl())
                .param("courseIdRef", resource.getCourseIdRef())
                .param("downloadCount", resource.getDownloadCount())
                .param("createdAt", Timestamp.valueOf(now))
                .update(keyHolder, "id");

        Number key = keyHolder.getKey();
        if (key != null) {
            resource.setId(key.longValue());
        }
        return resource;
    }

    public void incrementDownloadCount(Long id) {
        jdbcClient.sql("UPDATE resources SET download_count = download_count + 1 WHERE id = :id")
                .param("id", id)
                .update();
    }
}

