package com.craftify.shared.service.capi;

import java.util.Optional;
import java.util.UUID;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudService<T> {
  Page<T> findAll(Pageable pageable);

  Optional<T> findById(UUID id);

  T save(T entity);

  void deleteById(UUID id);
}
