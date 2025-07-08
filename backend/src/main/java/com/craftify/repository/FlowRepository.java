package com.craftify.repository;

import com.craftify.model.Flow;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlowRepository extends MongoRepository<Flow, String> {
  Page<Flow> findAllByUserId(String userId, Pageable pageable);

  Optional<Flow> findByIdAndUserId(String id, String userId);
}
