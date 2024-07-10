package com.craftify.shared.controller;

import com.craftify.shared.dto.IdentifiedDto;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public abstract class CrudController<DTO extends IdentifiedDto<ID>, ID> {

  private final CrudService<DTO, ID> service;

  protected CrudController(CrudService<DTO, ID> service) {
    this.service = service;
  }

  @GetMapping
  public Page<DTO> getAll(Pageable pageable) {
    return service.findAll(pageable);
  }

  @GetMapping("/{id}")
  public DTO getById(@PathVariable ID id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "path id is required");
    }
    return service
        .findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "document not found"));
  }

  @PostMapping
  public DTO create(@Valid @RequestBody DTO entity) {
    ID id = entity.getId();
    if (id != null && service.findById(id).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, "document already exists");
    }
    entity.setId(null);
    return service.save(entity);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable ID id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "path id is required");
    }
    if (service.findById(id).isEmpty()) {
      throw new ApiException(HttpStatus.NOT_FOUND, "document not found");
    }
    service.deleteById(id);
  }
}
