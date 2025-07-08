package com.craftify.controller;

import com.craftify.dto.SchemaDto;
import com.craftify.model.Schema;
import com.craftify.service.SchemaService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/schemas")
@Tag(name = "Schema Management", description = "CRUD operations for managing data schemas")
public class SchemaController {

  private final SchemaService service;

  public SchemaController(SchemaService service) {
    this.service = service;
  }

  @Operation(summary = "Create a new schema")
  @ApiResponse(
      responseCode = "200",
      description = "Schema created",
      content =
          @Content(
              schema =
                  @io.swagger.v3.oas.annotations.media.Schema(implementation = SchemaDto.class)))
  @PostMapping
  public ResponseEntity<SchemaDto> create(@RequestBody SchemaDto dto) {
    var created = service.create(toEntity(dto));
    return ResponseEntity.ok(toDto(created));
  }

  @Operation(summary = "List all schemas with pagination")
  @ApiResponse(
      responseCode = "200",
      description = "List of schemas",
      content =
          @Content(
              schema =
                  @io.swagger.v3.oas.annotations.media.Schema(implementation = SchemaDto.class)))
  @GetMapping
  public ResponseEntity<Page<SchemaDto>> list(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    var paginated = service.list(page, size).map(this::toDtoWithPlaceholderCount);
    return ResponseEntity.ok(paginated);
  }

  @Operation(summary = "Get a schema by ID")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Schema found",
        content =
            @Content(
                schema =
                    @io.swagger.v3.oas.annotations.media.Schema(implementation = SchemaDto.class))),
    @ApiResponse(responseCode = "404", description = "Schema not found")
  })
  @GetMapping("/{id}")
  public ResponseEntity<SchemaDto> detail(@PathVariable String id) {
    return service
        .getById(id)
        .map(this::toDtoWithPlaceholderCount)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Update a schema by ID")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Schema updated",
        content =
            @Content(
                schema =
                    @io.swagger.v3.oas.annotations.media.Schema(implementation = SchemaDto.class))),
    @ApiResponse(responseCode = "409", description = "Cannot update schema due to restrictions"),
    @ApiResponse(responseCode = "404", description = "Schema not found")
  })
  @PutMapping("/{id}")
  public ResponseEntity<SchemaDto> update(@PathVariable String id, @RequestBody SchemaDto dto) {
    return service
        .update(id, toEntity(dto))
        .map(this::toDtoWithPlaceholderCount)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Delete a schema by ID")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Schema deleted"),
    @ApiResponse(
        responseCode = "409",
        description = "Cannot delete schema due to associated records")
  })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    if (!service.canDelete(id)) {
      return ResponseEntity.status(409).build();
    }
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  private SchemaDto toDtoWithPlaceholderCount(Schema schema) {
    return new SchemaDto(
        schema.id(),
        schema.name(),
        schema.description(),
        schema.schema(),
        service.countRecords(schema.id()));
  }

  private Schema toEntity(SchemaDto dto) {
    return new Schema(dto.id(), dto.name(), dto.description(), dto.schema(), null);
  }

  private SchemaDto toDto(Schema schema) {
    return new SchemaDto(
        schema.id(),
        schema.name(),
        schema.description(),
        schema.schema(),
        service.countRecords(schema.id()));
  }
}
