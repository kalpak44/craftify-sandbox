package com.craftify.shared.controller;

import com.craftify.shared.dto.IdentifiedDto;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudService;
import com.craftify.shared.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@CrossOrigin(origins = "*")
@SecurityRequirement(name = "bearerAuthorization")
public abstract class CrudController<
    DTO extends IdentifiedDto<ID>, ID, FILTER extends SearchFilter> {

  private final CrudService<DTO, ID, FILTER> service;
  private final CurrentUserService currentUserService;

  protected CrudController(
      CrudService<DTO, ID, FILTER> service, CurrentUserService currentUserService) {
    this.service = service;
    this.currentUserService = currentUserService;
  }

  @GetMapping
  @Operation(summary = "List all entries in a paginated response", operationId = "getAll")
  public Page<DTO> getAll(Pageable pageable, @ParameterObject FILTER searchFilter) {
    return service.findAll(pageable, searchFilter, this.getCurrentUserId());
  }

  @GetMapping("/{id}")
  @Operation(summary = "Retrieve a specific entry by ID", operationId = "getById")
  public DTO getById(@PathVariable ID id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    return service
        .findById(id, this.getCurrentUserId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
  }

  @PostMapping
  @Operation(summary = "Create a new entry", operationId = "create")
  @Transactional
  public DTO create(@RequestBody DTO entity) {
    entity.setId(null);
    return service.save(entity, this.getCurrentUserId());
  }

  @DeleteMapping("/{id}")
  @Operation(summary = "Delete a specific entry by ID", operationId = "deleteById")
  @Transactional
  public void delete(@PathVariable ID id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    var currentUserId = this.getCurrentUserId();
    if (service.findById(id, currentUserId).isEmpty()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "Document not found.");
    }
    service.deleteById(id, currentUserId);
  }

  @PatchMapping("/{id}")
  @Operation(summary = "Update an existing entry by ID", operationId = "update")
  @Transactional
  public DTO update(@PathVariable ID id, @RequestBody DTO updateEntity) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    var currentUserId = this.getCurrentUserId();
    service
        .findById(id, currentUserId)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
    service.deleteById(id, currentUserId);
    updateEntity.setId(id);

    return service.save(updateEntity, currentUserId);
  }

  protected String getCurrentUserId() {
    return currentUserService.getCurrentUserId();
  }
}
