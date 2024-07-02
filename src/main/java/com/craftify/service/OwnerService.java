package com.craftify.service;

import com.craftify.documents.Owner;
import com.craftify.repository.OwnerRepository;
import com.craftify.service.api.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class OwnerService extends CrudServiceAbstract<Owner> {
  public OwnerService(OwnerRepository repository) {
    super(repository);
  }
}
