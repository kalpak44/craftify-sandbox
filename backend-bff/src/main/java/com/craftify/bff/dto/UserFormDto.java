package com.craftify.bff.dto;

import java.time.Instant;

public record UserFormDto(String id, String name, Instant createdAt, Instant updatedAt) {
}
