package com.craftify.controller;

import com.craftify.dto.RecordDto;
import com.craftify.dto.RecordSummaryDto;
import com.craftify.model.DataRecord;
import com.craftify.service.RecordsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
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

@RestController
@RequestMapping("/schemas/{schemaId}/records")
@Tag(
    name = "Schema Data Management",
    description = "CRUD operations for managing schema-bound records")
public class RecordController {

  private final RecordsService service;

  public RecordController(RecordsService service) {
    this.service = service;
  }

  /** Create a new record. */
  @Operation(summary = "Create a new record under the schema")
  @ApiResponse(
      responseCode = "200",
      description = "Record created",
      content = @Content(schema = @Schema(implementation = RecordDto.class)))
  @PostMapping
  public ResponseEntity<RecordDto> create(
      @PathVariable String schemaId, @RequestBody RecordDto dto) {
    var created = service.create(toEntity(dto, schemaId));
    return ResponseEntity.ok(toFullDto(created));
  }

  /** List record summaries. */
  @Operation(summary = "List record summaries")
  @ApiResponse(
      responseCode = "200",
      description = "List of record summaries",
      content = @Content(schema = @Schema(implementation = RecordSummaryDto.class)))
  @GetMapping
  public ResponseEntity<Page<RecordSummaryDto>> list(
      @PathVariable String schemaId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    return ResponseEntity.ok(service.list(schemaId, page, size));
  }

  /** Get a single record by ID. */
  @Operation(summary = "Get a record by ID")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Record found",
        content = @Content(schema = @Schema(implementation = RecordDto.class))),
    @ApiResponse(responseCode = "404", description = "Record not found")
  })
  @GetMapping("/{recordId}")
  public ResponseEntity<RecordDto> detail(
      @PathVariable String schemaId, @PathVariable String recordId) {
    return service
        .getById(schemaId, recordId)
        .map(this::toFullDto)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  /** Update an existing record. */
  @Operation(summary = "Update a record")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Record updated",
        content = @Content(schema = @Schema(implementation = RecordDto.class))),
    @ApiResponse(responseCode = "404", description = "Record not found"),
    @ApiResponse(responseCode = "409", description = "Update not allowed or validation failed")
  })
  @PutMapping("/{recordId}")
  public ResponseEntity<RecordDto> update(
      @PathVariable String schemaId, @PathVariable String recordId, @RequestBody RecordDto dto) {

    return service
        .update(schemaId, recordId, toEntity(dto, schemaId))
        .map(this::toFullDto)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  /** Delete a record. */
  @Operation(summary = "Delete a record")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Record deleted"),
    @ApiResponse(responseCode = "404", description = "Record not found")
  })
  @DeleteMapping("/{recordId}")
  public ResponseEntity<Void> delete(@PathVariable String schemaId, @PathVariable String recordId) {
    return service.delete(schemaId, recordId)
        ? ResponseEntity.noContent().build()
        : ResponseEntity.notFound().build();
  }

  // Conversion helpers (inline instead of mappers)
  private RecordDto toFullDto(DataRecord r) {
    return new RecordDto(r.id(), r.name(), r.description(), r.createdAt(), r.updatedAt(), r.data());
  }

  private RecordSummaryDto toSummaryDto(DataRecord r) {
    return new RecordSummaryDto(r.id(), r.name(), r.description(), r.createdAt(), r.updatedAt());
  }

  private DataRecord toEntity(RecordDto dto, String schemaId) {
    return new DataRecord(
        dto.id(), schemaId, null, dto.name(), dto.description(), null, null, dto.data());
  }
}
