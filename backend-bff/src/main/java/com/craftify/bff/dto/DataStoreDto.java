package com.craftify.bff.dto;

import java.time.Instant;

public record DataStoreDto(String id, String name, String description, String type, Instant createdAt) {
}
