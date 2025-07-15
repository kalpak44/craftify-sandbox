package com.craftify.dto;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "DTO for creating a new function including its folder name and environment")
public record CreateFunctionRequestDto(

        @Schema(description = "The parent folder where the function should be created", example = "my-folder/")
        String folder,

        @Schema(description = "Name of the function", example = "myFunction")
        String name,

        @Schema(description = "Runtime environment")
        EnvironmentType environment
) {}
