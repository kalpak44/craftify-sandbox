package com.craftify.owners.repository;

import com.craftify.owners.document.OwnerDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OwnerRepository extends MongoRepository<OwnerDocument, String> {}
