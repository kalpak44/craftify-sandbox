package com.craftify.shared.service;

import com.craftify.shared.document.UserDataDocument;
import com.craftify.shared.dto.IdentifiedDto;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.repository.UserDataRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public abstract class CrudServiceAbstract<
        ENTITY extends UserDataDocument,
        DTO extends IdentifiedDto<ID>,
        ID,
        FILTER extends SearchFilter>
    implements CrudService<DTO, ID, FILTER> {

  private final UserDataRepository<ENTITY, ID> repository;

  public CrudServiceAbstract(UserDataRepository<ENTITY, ID> repository) {
    this.repository = repository;
  }

  @Override
  public Page<DTO> findAll(Pageable pageable, FILTER searchFilter, String currentUserId) {
    return repository.findAllByUserId(pageable, currentUserId).map(this::toDto);
  }

  @Override
  public Optional<DTO> findById(ID id, String currentUserId) {
    return repository.findByIdAndUserId(id, currentUserId).map(this::toDto);
  }

  @Override
  public DTO save(DTO dto, String currentUserId) {
    ENTITY entity = this.toEntity(dto);
    if (entity == null) {
      return null;
    }
    entity.setUserId(currentUserId);
    return toDto(repository.save(entity));
  }

  @Override
  public void deleteById(ID id, String currentUserId) {
    repository.deleteByIdAndUserId(id, currentUserId);
  }

  protected abstract DTO toDto(ENTITY entity) throws ApiException;

  protected abstract ENTITY toEntity(DTO dto) throws ApiException;
}
