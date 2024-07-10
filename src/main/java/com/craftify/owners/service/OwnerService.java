package com.craftify.owners.service;

import com.craftify.owners.documents.Owner;
import com.craftify.owners.dto.OwnerDto;
import com.craftify.owners.repository.OwnerRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class OwnerService extends CrudServiceAbstract<Owner, OwnerDto, String> {
  public OwnerService(OwnerRepository repository) {
    super(repository);
  }

  @Override
  protected OwnerDto toDto(Owner entity) throws ApiException {
    final var ownerDto = new OwnerDto();
    ownerDto.setName(entity.getName());
    ownerDto.setId(ownerDto.getId());
    return ownerDto;
  }

  @Override
  protected Owner toEntity(OwnerDto dto) throws ApiException {
    final var owner = new Owner();
    owner.setId(dto.getId());
    owner.setName(dto.getName());
    return owner;
  }
}
