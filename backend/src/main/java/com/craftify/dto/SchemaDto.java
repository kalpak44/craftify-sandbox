package com.craftify.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "Data transfer object representing a Schema definition")
public record SchemaDto(
    @Schema(description = "ID of the schema", example = "abc123") String id,
    @Schema(description = "Name of the schema", example = "ProductSchema") String name,
    @Schema(description = "Description of the schema", example = "Schema for product entries")
        String description,
    @Schema(description = "JSON Schema definition") Object schema,
    @Schema(description = "Count of records using this schema") int recordCount) {}
