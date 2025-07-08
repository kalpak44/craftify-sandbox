package com.craftify.model;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "data_records")
public record DataRecord(
    String id,
    String schemaId,
    String userId,
    String name,
    String description,
    @CreatedDate Instant createdAt,
    @LastModifiedDate Instant updatedAt,
    Map<String, Object> data) {}
