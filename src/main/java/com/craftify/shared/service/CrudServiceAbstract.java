package com.craftify.shared.service;

import com.craftify.shared.dto.IdentifiedDto;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public abstract class CrudServiceAbstract<
        ENTITY, DTO extends IdentifiedDto<ID>, ID, FILTER extends SearchFilter>
    implements CrudService<DTO, ID, FILTER> {

  private final MongoRepository<ENTITY, ID> repository;

  public CrudServiceAbstract(MongoRepository<ENTITY, ID> repository) {
    this.repository = repository;
  }

  @Override
  public Page<DTO> findAll(Pageable pageable, FILTER searchFilter, String currentUserId) {
    return repository.findAll(pageable).map(this::toDto);
  }

  @Override
  public Optional<DTO> findById(ID id, String currentUserId) {
    return repository.findById(id).map(this::toDto);
  }

  @Override
  public DTO save(DTO dto, String currentUserId) {
    ENTITY entity = this.toEntity(dto);
    return entity != null ? toDto(repository.save(entity)) : null;
  }

  @Override
  public void deleteById(ID id) {
    repository.deleteById(id);
  }

  protected abstract DTO toDto(ENTITY entity) throws ApiException;

  protected abstract ENTITY toEntity(DTO dto) throws ApiException;
}
