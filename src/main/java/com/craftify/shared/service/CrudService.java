package com.craftify.shared.service;

import com.craftify.shared.dto.SearchFilter;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface CrudService<DTO, ID, FILTER extends SearchFilter> {
  Page<DTO> findAll(Pageable pageable, FILTER searchFilter);

  Optional<DTO> findById(ID id);

  DTO save(DTO entity);

  void deleteById(ID id);
}
