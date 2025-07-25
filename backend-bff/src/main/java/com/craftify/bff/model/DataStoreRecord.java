package com.craftify.bff.model;

import java.time.Instant;
import java.util.Map;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "data_store_records")
public record DataStoreRecord(
    String id,
    @Indexed(unique = true) String name,
    String dataStoreId,
    Instant createdAt,
    Instant updatedAt,
    Map<String, Object> record,
    String userId) {}
