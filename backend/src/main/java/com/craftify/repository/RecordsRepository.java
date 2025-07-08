package com.craftify.repository;

import com.craftify.model.Record;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RecordsRepository extends MongoRepository<Record, String> {
  Page<Record> findAllBySchemaIdAndUserId(String schemaId, String userId, Pageable pageable);

  Optional<Record> findByIdAndSchemaIdAndUserId(String id, String schemaId, String userId);

  void deleteByIdAndSchemaIdAndUserId(String id, String schemaId, String userId);
}
