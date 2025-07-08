package com.craftify.model;

import java.util.Map;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "data_records")
public record Record(String id, String schemaId, String userId, Map<String, Object> data) {}
