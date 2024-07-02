package com.craftify.repository;

import com.craftify.documents.Owner;
import java.util.UUID;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface OwnerRepository extends MongoRepository<Owner, UUID> {}
