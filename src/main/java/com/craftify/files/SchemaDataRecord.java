package com.craftify.files;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;
import java.util.Map;

@Document(collection = "schema_data_records")
public class SchemaDataRecord {
    @Id
    private String id;
    private String schemaId;
    private String userId;
    private Map<String, Object> data;
    private Instant createdAt;
    private Instant updatedAt;

    public SchemaDataRecord() {
        this.createdAt = Instant.now();
        this.updatedAt = Instant.now();
    }

    public SchemaDataRecord(String schemaId, String userId, Map<String, Object> data) {
        this();
        this.schemaId = schemaId;
        this.userId = userId;
        this.data = data;
    }

    // Getters and Setters
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getSchemaId() {
        return schemaId;
    }

    public void setSchemaId(String schemaId) {
        this.schemaId = schemaId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
        this.updatedAt = Instant.now();
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(Instant updatedAt) {
        this.updatedAt = updatedAt;
    }
} 