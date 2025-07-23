package com.craftify.bff.model;

import java.time.Instant;
import java.util.Map;

public record DataStoreRecordDetails(String name, Instant createdAt, Instant updatedAt, String dataStoreName,
                                     String viewerType, Map<String, Object> recordData) {
}
