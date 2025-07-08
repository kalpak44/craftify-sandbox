package com.craftify.dto;

import java.time.Instant;
import java.util.Map;

/** Full DTO representing record data for detail views and create/update. */
public record RecordDto(
    String id,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt,
    Map<String, Object> data) {}
