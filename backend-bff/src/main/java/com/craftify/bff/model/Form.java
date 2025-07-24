package com.craftify.bff.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;
import java.util.List;

@Document(collection = "form_definitions")
public record Form(
        @Id String id, @Indexed(unique = true) String name, Instant createdAt, Instant updatedAt, List<Object> fields, String userId) {
}