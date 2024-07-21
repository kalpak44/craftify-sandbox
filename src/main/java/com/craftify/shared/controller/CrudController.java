package com.craftify.shared.controller;

import com.craftify.shared.dto.IdentifiedDto;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;

public abstract class CrudController<
    DTO extends IdentifiedDto<ID>, ID, FILTER extends SearchFilter> {

  private final CrudService<DTO, ID, FILTER> service;

  protected CrudController(CrudService<DTO, ID, FILTER> service) {
    this.service = service;
  }

  @GetMapping
  @Operation(summary = "List all entries in a paginated response", operationId = "getAll")
  public Page<DTO> getAll(Pageable pageable, @RequestParam(required = false) FILTER searchFilter) {
    return service.findAll(pageable, searchFilter);
  }

  @GetMapping("/{id}")
  @Operation(summary = "Retrieve a specific entry by ID", operationId = "getById")
  public DTO getById(@PathVariable ID id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    return service
        .findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
  }

  @PostMapping
  @Operation(summary = "Create a new entry", operationId = "create")
  public DTO create(@RequestBody DTO entity) {
    entity.setId(null);
    return service.save(entity);
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a specific entry by ID", operationId = "deleteById")
  public void delete(@PathVariable ID id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    if (service.findById(id).isEmpty()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Document not found.");
    }
    service.deleteById(id);
  }

  @PatchMapping("/{id}")
  @Operation(summary = "Update an existing entry by ID", operationId = "update")
  public DTO update(@PathVariable ID id, @RequestBody DTO updateEntity) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    service
        .findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
    service.deleteById(id);
    updateEntity.setId(id);

    return service.save(updateEntity);
  }
}
