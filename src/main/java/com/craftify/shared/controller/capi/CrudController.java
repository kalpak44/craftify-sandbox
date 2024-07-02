package com.craftify.shared.controller.capi;

import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.capi.CrudService;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

public abstract class CrudController<T> {

  private final CrudService<T> service;

  protected CrudController(CrudService<T> service) {
    this.service = service;
  }

  @GetMapping
  public Page<T> getAll(Pageable pageable) {
    return service.findAll(pageable);
  }

  @GetMapping("/{id}")
  public T getById(@PathVariable UUID id) {
    return service
        .findById(id)
        .orElseThrow(
            () -> new ApiException(HttpStatus.NOT_FOUND, this.getEntityName() + " not found"));
  }

  @PostMapping
  public T create(@RequestBody T entity) {
    UUID id = getId(entity);
    if (service.findById(id).isPresent()) {
      throw new ApiException(HttpStatus.CONFLICT, this.getEntityName() + " already exists");
    }
    return service.save(entity);
  }

  @DeleteMapping("/{id}")
  public void delete(@PathVariable UUID id) {
    if (service.findById(id).isEmpty()) {
      throw new ApiException(HttpStatus.NOT_FOUND, this.getEntityName() + " not found");
    }
    service.deleteById(id);
  }

  protected abstract UUID getId(T entity);

  protected abstract String getEntityName();
}
