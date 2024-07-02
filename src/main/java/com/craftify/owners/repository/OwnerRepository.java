package com.craftify.owners.repository;

import com.craftify.owners.documents.Owner;
import java.util.UUID;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OwnerRepository extends MongoRepository<Owner, UUID> {}
