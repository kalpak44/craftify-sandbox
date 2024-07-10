package com.craftify.shared.service;

import java.util.Optional;

import com.craftify.shared.dto.IdentifiedDto;
import com.craftify.shared.exception.ApiException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public abstract class CrudServiceAbstract<ENTITY, DTO extends IdentifiedDto<ID>, ID>
    implements CrudService<DTO, ID> {

  private final MongoRepository<ENTITY, ID> repository;

  public CrudServiceAbstract(MongoRepository<ENTITY, ID> repository) {
    this.repository = repository;
  }

  @Override
  public Page<DTO> findAll(Pageable pageable) {
    return repository.findAll(pageable).map(this::toDto);
  }

  @Override
  public Optional<DTO> findById(ID id) {
    return repository.findById(id).map(this::toDto);
  }

  @Override
  public DTO save(DTO dto) {
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
