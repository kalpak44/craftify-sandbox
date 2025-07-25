package com.craftify.bff.model;

import java.time.Instant;
import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "form_definitions")
public record Form(
    @Id String id,
    @Indexed(unique = true) String name,
    Instant createdAt,
    Instant updatedAt,
    List<Object> fields,
    String userId) {}
