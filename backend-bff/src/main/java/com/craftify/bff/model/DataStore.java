package com.craftify.bff.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "data_stores")
public record DataStore(
        @Id String id, @Indexed(unique = true) String name, String description, String type, Instant createdAt, String userId) {
}