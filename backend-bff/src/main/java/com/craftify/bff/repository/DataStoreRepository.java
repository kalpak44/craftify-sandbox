package com.craftify.bff.repository;

import com.craftify.bff.model.DataStore;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataStoreRepository extends MongoRepository<DataStore, String> {
  Page<DataStore> findAllByUserId(String userId, Pageable pageable);

  Optional<DataStore> findByIdAndUserId(String id, String userId);
}
