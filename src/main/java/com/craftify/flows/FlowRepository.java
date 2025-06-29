package com.craftify.flows;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FlowRepository extends MongoRepository<Flow, String> {
    Page<Flow> findByUserId(String userId, Pageable pageable);
}