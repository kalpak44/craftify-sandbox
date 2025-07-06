package com.craftify.dto;

import io.swagger.v3.oas.annotations.media.Schema;
import java.util.List;

@Schema(description = "Data transfer object representing a Flow")
public record FlowDto(
        @Schema(description = "ID of the flow", example = "64f27e2e6c98a83d6beabc11")
        String id,

        @Schema(description = "Name of the flow", example = "Example Flow")
        String flowName,

        @Schema(description = "Description of the flow", example = "This is an example flow.")
        String flowDescription,

        @Schema(description = "List of parameters for the flow")
        List<ParameterDto> parameters
) {
    public record ParameterDto(
            @Schema(description = "Key of the parameter", example = "param1")
            String key
    ) {}
}
