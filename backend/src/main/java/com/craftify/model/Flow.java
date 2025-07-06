package com.craftify.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.util.List;

@Document(collection = "flows")
public record Flow(
        @Id String id,
        String flowName,
        String flowDescription,
        List<Parameter> parameters
) {
    public record Parameter(String key) {}
}
