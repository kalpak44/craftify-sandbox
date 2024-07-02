package com.craftify.shared.service.capi;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public class CrudServiceAbstract<T> implements CrudService<T> {

  private final MongoRepository<T, UUID> repository;

  public CrudServiceAbstract(MongoRepository<T, UUID> repository) {
    this.repository = repository;
  }

  @Override
  public Page<T> findAll(Pageable pageable) {
    return repository.findAll(pageable);
  }

  @Override
  public Optional<T> findById(UUID id) {
    return repository.findById(id);
  }

  @Override
  public T save(T entity) {
    return repository.save(entity);
  }

  @Override
  public void deleteById(UUID id) {
    repository.deleteById(id);
  }
}
