package com.craftify.bff.model;

import java.time.Instant;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "data_stores")
public record DataStore(
    @Id String id,
    @Indexed(unique = true) String name,
    String description,
    String type,
    Instant createdAt,
    String userId) {}
