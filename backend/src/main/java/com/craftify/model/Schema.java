package com.craftify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "data_schemas")
public record Schema(
    @Id String id, String name, String description, Object schema, String userId) {}
