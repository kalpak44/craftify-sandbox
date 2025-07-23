package com.craftify.bff.controller;

import com.craftify.bff.dto.DataStoreDto;
import com.craftify.bff.dto.DataStoreRecordDto;
import com.craftify.bff.model.DataStore;
import com.craftify.bff.model.DataStoreRecord;
import com.craftify.bff.model.DataStoreRecordDetails;
import com.craftify.bff.service.DataStoreService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
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
            content =
            @Content(
                    schema =
                    @io.swagger.v3.oas.annotations.media.Schema(implementation = DataStoreDto.class)))
    @PostMapping
    public ResponseEntity<DataStoreDto> create(@RequestBody DataStoreDto dto) {
        var created = service.create(toEntity(dto));
        return ResponseEntity.ok(toDto(created));
    }

    @Operation(summary = "List all data stores with pagination")
    @ApiResponse(
            responseCode = "200",
            description = "List of data stores",
            content =
            @Content(
                    schema =
                    @io.swagger.v3.oas.annotations.media.Schema(implementation = DataStoreDto.class)))
    @GetMapping
    public ResponseEntity<Page<DataStoreDto>> list(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        var paginated = service.list(page, size).map(this::toDto);
        return ResponseEntity.ok(paginated);
    }


    @Operation(summary = "List all data stores records with pagination")
    @ApiResponse(
            responseCode = "200",
            description = "List of data stores",
            content =
            @Content(
                    schema =
                    @io.swagger.v3.oas.annotations.media.Schema(implementation = DataStoreDto.class)))
    @GetMapping("{id}/records")
    public ResponseEntity<Page<DataStoreRecordDto>> listRecords(@PathVariable String id,
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        var paginated = service.listRecords(id, page, size).map(this::toRecordDto);
        return ResponseEntity.ok(paginated);
    }

    @Operation(summary = "Get a data store details by id and record id")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Details found",
                    content =
                    @Content(
                            schema =
                            @io.swagger.v3.oas.annotations.media.Schema(implementation = DataStoreDto.class))),
            @ApiResponse(responseCode = "404", description = "Data Store not found")
    })
    @GetMapping("/{id}/records/{recordId}")
    public ResponseEntity<DataStoreRecordDetails> detail(@PathVariable String id, @PathVariable String recordId) {
        return service
                .getDetails(id, recordId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }





    @Operation(summary = "Update a data store by ID")
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Data store updated",
                    content =
                    @Content(
                            schema =
                            @io.swagger.v3.oas.annotations.media.Schema(implementation = DataStoreDto.class))),
            @ApiResponse(responseCode = "409", description = "Cannot update data store due to restrictions"),
            @ApiResponse(responseCode = "404", description = "Data store not found")
    })
    @PutMapping("/{id}")
    public ResponseEntity<DataStoreDto> update(@PathVariable String id, @RequestBody DataStoreDto dto) {
        return service
                .update(id, toEntity(dto))
                .map(this::toDto)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @Operation(summary = "Delete a data store by ID")
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Data store deleted"),
            @ApiResponse(
                    responseCode = "409",
                    description = "Cannot delete data store due to associated records")
    })
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable String id) {
        if (!service.canDelete(id)) {
            return ResponseEntity.status(409).build();
        }
        service.delete(id);
        return ResponseEntity.noContent().build();
    }



    private DataStore toEntity(DataStoreDto dto) {
        return new DataStore(null, dto.name(), dto.description(), dto.type(), dto.createdAt(), null);
    }

    private DataStoreDto toDto(DataStore entity) {
        var records = service.recordsCount(entity.id());
        return new DataStoreDto(entity.id(), entity.name(), entity.description(), entity.type(), records, entity.createdAt());
    }


    private DataStoreRecordDto toRecordDto(DataStoreRecord entity) {
        return new DataStoreRecordDto(entity.id(), entity.name(), entity.createdAt(), entity.updatedAt(), entity.record());
    }

}
