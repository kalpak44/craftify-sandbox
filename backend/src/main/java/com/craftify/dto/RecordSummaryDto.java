package com.craftify.dto;

import java.time.Instant;

/** Summary DTO returned in list endpoints to avoid full data payload. */
public record RecordSummaryDto(
    String id, String name, String description, Instant createdAt, Instant updatedAt) {}
