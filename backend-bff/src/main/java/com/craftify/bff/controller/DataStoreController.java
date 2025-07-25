package com.craftify.bff.controller;

import com.craftify.bff.dto.DataStoreDto;
import com.craftify.bff.dto.DataStoreRecordDto;
import com.craftify.bff.model.DataStore;
import com.craftify.bff.model.DataStoreRecord;
import com.craftify.bff.model.DataStoreRecordDetails;
import com.craftify.bff.service.DataStoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/data-stores")
@Tag(name = "Data Store Management", description = "CRUD operations for managing data stores")
public class DataStoreController {

  private final DataStoreService service;

  public DataStoreController(DataStoreService service) {
    this.service = service;
  }

  @Operation(summary = "Create a new data store")
  @ApiResponse(
      responseCode = "200",
      description = "Data store created",
      content = @Content(schema = @Schema(implementation = DataStoreDto.class)))
  @PostMapping
  public ResponseEntity<DataStoreDto> create(@RequestBody DataStoreDto dto) {
    var created = service.create(toEntity(dto));
    return ResponseEntity.ok(toDto(created));
  }

  @Operation(summary = "List all data stores with pagination")
  @ApiResponse(
      responseCode = "200",
      description = "List of data stores",
      content = @Content(schema = @Schema(implementation = DataStoreDto.class)))
  @GetMapping
  public ResponseEntity<Page<DataStoreDto>> list(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    var paginated = service.list(page, size).map(this::toDto);
    return ResponseEntity.ok(paginated);
  }

  @Operation(summary = "List all data store records with pagination")
  @ApiResponse(
      responseCode = "200",
      description = "List of records",
      content = @Content(schema = @Schema(implementation = DataStoreRecordDto.class)))
  @GetMapping("{id}/records")
  public ResponseEntity<Page<DataStoreRecordDto>> listRecords(
      @PathVariable String id,
      @RequestParam(defaultValue = "0") int page,
      @RequestParam(defaultValue = "10") int size) {
    var paginated = service.listRecords(id, page, size).map(this::toRecordDto);
    return ResponseEntity.ok(paginated);
  }

  @Operation(summary = "Get record details by data store ID and record ID")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Details found",
        content = @Content(schema = @Schema(implementation = DataStoreRecordDetails.class))),
    @ApiResponse(responseCode = "404", description = "Data Store or Record not found")
  })
  @GetMapping("/{id}/records/{recordId}")
  public ResponseEntity<DataStoreRecordDetails> detail(
      @PathVariable String id, @PathVariable String recordId) {
    return service
        .getDetails(id, recordId)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Create a new record in a data store")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Record created",
        content = @Content(schema = @Schema(implementation = DataStoreRecordDto.class))),
    @ApiResponse(responseCode = "409", description = "Record with the same name already exists")
  })
  @PostMapping("/{id}/records")
  public ResponseEntity<?> createRecord(
      @PathVariable("id") String dataStoreId, @RequestBody DataStoreRecordDto dto) {
    try {
      var created = service.createRecord(dataStoreId, dto.name(), dto.record());
      return ResponseEntity.ok(toRecordDto(created));
    } catch (IllegalStateException e) {
      return ResponseEntity.status(409).body(e.getMessage());
    }
  }

  @Operation(summary = "Update a data store by ID")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "Data store updated",
        content = @Content(schema = @Schema(implementation = DataStoreDto.class))),
    @ApiResponse(responseCode = "404", description = "Data store not found")
  })
  @PutMapping("/{id}")
  public ResponseEntity<DataStoreDto> update(
      @PathVariable String id, @RequestBody DataStoreDto dto) {
    return service
        .update(id, toEntity(dto))
        .map(updated -> ResponseEntity.ok(toDto(updated)))
        .orElse(ResponseEntity.notFound().build());
  }

  @Operation(summary = "Delete a data store by ID")
  @ApiResponses({
    @ApiResponse(responseCode = "204", description = "Data store deleted"),
    @ApiResponse(responseCode = "409", description = "Cannot delete due to related records")
  })
  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    if (!service.canDelete(id)) {
      return ResponseEntity.status(409).build();
    }
    service.delete(id);
    return ResponseEntity.noContent().build();
  }

  @Operation(summary = "Delete a record by ID in a specific data store")
  @ApiResponses({
          @ApiResponse(responseCode = "204", description = "Record deleted"),
          @ApiResponse(responseCode = "404", description = "Data store or record not found")
  })
  @DeleteMapping("/{dataStoreId}/records/{recordId}")
  public ResponseEntity<Void> deleteRecord(
          @PathVariable String dataStoreId, @PathVariable String recordId) {
    try {
      service.deleteRecord(dataStoreId, recordId);
      return ResponseEntity.noContent().build();
    } catch (IllegalArgumentException e) {
      return ResponseEntity.notFound().build();
    }
  }

  // Helper mapping methods
  private DataStore toEntity(DataStoreDto dto) {
    return new DataStore(null, dto.name(), dto.description(), dto.type(), dto.createdAt(), null);
  }

  private DataStoreDto toDto(DataStore entity) {
    var records = service.recordsCount(entity.id());
    return new DataStoreDto(
        entity.id(),
        entity.name(),
        entity.description(),
        entity.type(),
        records,
        entity.createdAt());
  }

  private DataStoreRecordDto toRecordDto(DataStoreRecord entity) {
    return new DataStoreRecordDto(
        entity.id(), entity.name(), entity.createdAt(), entity.updatedAt(), entity.record());
  }
}
