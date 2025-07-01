package com.craftify.flows;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NodeTemplateRepository extends MongoRepository<NodeTemplate, String> {
  Page<NodeTemplate> findByUserId(String userId, Pageable pageable);
}
