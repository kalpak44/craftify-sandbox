package com.craftify.controller;

import com.craftify.dto.FlowDto;
import com.craftify.dto.FlowDto.ParameterDto;
import com.craftify.model.Flow;
import com.craftify.model.Flow.Parameter;
import com.craftify.service.FlowService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@RestController
@RequestMapping("/flows")
@Tag(name = "Flow Management", description = "CRUD operations for managing flows")
public class FlowController {

    private final FlowService flowService;

    @Autowired
    public FlowController(FlowService flowService) {
        this.flowService = flowService;
    }

    @Operation(summary = "Create a new flow")
    @ApiResponse(responseCode = "200", description = "Flow created", content = @Content(schema = @Schema(implementation = FlowDto.class)))
    @PostMapping
    public ResponseEntity<FlowDto> create(@RequestBody FlowDto flowDto) {
        Flow flow = toEntity(flowDto);
        Flow saved = flowService.create(flow);
        return ResponseEntity.ok(toDto(saved));
    }

    @Operation(summary = "List all flows with pagination")
    @ApiResponse(responseCode = "200", description = "List of flows", content = @Content(schema = @Schema(implementation = FlowDto.class)))
    @GetMapping
    public ResponseEntity<Page<FlowDto>> list(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        var flows = flowService.list(page, size).map(this::toDto);
        return ResponseEntity.ok(flows);
    }

    @Operation(summary = "Get a flow by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Flow found", content = @Content(schema = @Schema(implementation = FlowDto.class))),
            @ApiResponse(responseCode = "404", description = "Flow not found")
    })
    @GetMapping("/{id}")
    public ResponseEntity<FlowDto> getById(@PathVariable String id) {
        return flowService.getById(id)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Update a flow by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "Flow updated", content = @Content(schema = @Schema(implementation = FlowDto.class))),
            @ApiResponse(responseCode = "404", description = "Flow not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<FlowDto> update(@PathVariable String id, @RequestBody FlowDto flowDto) {
        Flow updated = toEntity(flowDto);
        return flowService.update(id, updated)
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a flow by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Flow deleted"),
            @ApiResponse(responseCode = "404", description = "Flow not found")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        flowService.delete(id);
        return ResponseEntity.noContent().build();
    }


    private FlowDto toDto(Flow flow) {
       var paramDtos = Objects.requireNonNullElse(flow.parameters(), new ArrayList<Parameter>()).stream()
                .map(p -> new ParameterDto(p.key()))
                .toList();
        return new FlowDto(flow.id(), flow.flowName(), flow.flowDescription(), paramDtos);
    }

    private Flow toEntity(FlowDto dto) {
        var params = Objects.requireNonNullElse(dto.parameters(), new ArrayList<ParameterDto>()).stream()
                .map(p -> new Parameter(p.key()))
                .toList();
        return new Flow(dto.id(), dto.flowName(), dto.flowDescription(), params);
    }
}
