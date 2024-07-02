package com.craftify.owners.service;

import com.craftify.owners.documents.Owner;
import com.craftify.owners.repository.OwnerRepository;
import com.craftify.shared.service.capi.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class OwnerService extends CrudServiceAbstract<Owner> {
  public OwnerService(OwnerRepository repository) {
    super(repository);
  }
}
