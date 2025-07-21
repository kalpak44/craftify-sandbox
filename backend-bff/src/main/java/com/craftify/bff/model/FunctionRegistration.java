package com.craftify.bff.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "function_registration")
public record FunctionRegistration(
        @Id String id,
        String userId,
        String name,
        String status,
        String executionMode,
        String commitHash,
        Instant registeredAt
) {}