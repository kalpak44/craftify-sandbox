package com.craftify.shared.service;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudService<DTO, ID> {
  Page<DTO> findAll(Pageable pageable);

  Optional<DTO> findById(ID id);

  DTO save(DTO entity);

  void deleteById(ID id);
}
