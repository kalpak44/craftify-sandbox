package com.craftify.dto;

import java.time.Instant;
import java.util.Map;

/** DTO representing a single data record */
public record RecordDto(
    String id,
    String name,
    String description,
    Instant createdAt,
    Instant updatedAt,
    Map<String, Object> data) {}
