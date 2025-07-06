package com.craftify.dto;

import java.time.Instant;

public record FileItemDto(
        String name,
        FileType type,
        long size,
        Instant lastModified,
        String fullPath
) {
}