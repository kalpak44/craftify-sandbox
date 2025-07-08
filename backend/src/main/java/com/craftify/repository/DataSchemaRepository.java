package com.craftify.repository;

import com.craftify.model.DataSchema;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataSchemaRepository extends MongoRepository<DataSchema, String> {
  Page<DataSchema> findAllByUserId(String userId, Pageable pageable);

  Optional<DataSchema> findByIdAndUserId(String id, String userId);
}
