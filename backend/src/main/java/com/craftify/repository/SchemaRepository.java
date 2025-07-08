package com.craftify.repository;

import com.craftify.model.Schema;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SchemaRepository extends MongoRepository<Schema, String> {
  Page<Schema> findAllByUserId(String userId, Pageable pageable);

  Optional<Schema> findByIdAndUserId(String id, String userId);
}
