package com.craftify.controller;

import com.craftify.dto.RecordDto;
import com.craftify.service.RecordsService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.util.Optional;
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

  @Operation(summary = "Create a new record under the schema")
  @ApiResponse(
      responseCode = "200",
      description = "Record created successfully",
      content = @Content(schema = @Schema(implementation = RecordDto.class)))
  @PostMapping
  public ResponseEntity<RecordDto> create(
      @PathVariable String schemaId, @RequestBody RecordDto dto) {
    var created = service.create(schemaId, dto.data());
    return ResponseEntity.ok(new RecordDto(created.id(), created.data()));
  }

  @Operation(summary = "Get a paginated list of records")
  @ApiResponse(
      responseCode = "200",
      description = "Paginated list of records",
      content = @Content(schema = @Schema(implementation = RecordDto.class)))
  @GetMapping
  public ResponseEntity<Page<RecordDto>> list(
      @PathVariable String schemaId,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    var records = service.list(schemaId, page, size).map(r -> new RecordDto(r.id(), r.data()));
    return ResponseEntity.ok(records);
  }

  @Operation(summary = "Get a single record by ID")
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
    Optional<RecordDto> dto =
        service.getById(schemaId, recordId).map(r -> new RecordDto(r.id(), r.data()));
    return dto.map(ResponseEntity::ok).orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Update an existing record")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Record updated",
        content = @Content(schema = @Schema(implementation = RecordDto.class))),
    @ApiResponse(responseCode = "404", description = "Record not found"),
    @ApiResponse(responseCode = "409", description = "Validation failed or update not permitted")
  })
  @PutMapping("/{recordId}")
  public ResponseEntity<RecordDto> update(
      @PathVariable String schemaId, @PathVariable String recordId, @RequestBody RecordDto dto) {
    return service
        .update(schemaId, recordId, dto.data())
        .map(updated -> ResponseEntity.ok(new RecordDto(updated.id(), updated.data())))
        .orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Delete a record by ID")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Record deleted"),
    @ApiResponse(responseCode = "404", description = "Record not found")
  })
  @DeleteMapping("/{recordId}")
  public ResponseEntity<Void> delete(@PathVariable String schemaId, @PathVariable String recordId) {
    if (!service.delete(schemaId, recordId)) {
      return ResponseEntity.notFound().build();
    }
    return ResponseEntity.noContent().build();
  }
}
