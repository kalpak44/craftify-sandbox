package com.craftify.bff.dto;

import java.time.Instant;
import java.util.Map;

public record DataStoreRecordDto(
    String id, String name, Instant createdAt, Instant updatedAt, Map<String, Object> record) {}
