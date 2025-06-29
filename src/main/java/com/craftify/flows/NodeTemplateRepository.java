package com.craftify.flows;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.util.List;

public interface NodeTemplateRepository extends MongoRepository<NodeTemplate, String> {
    Page<NodeTemplate> findByUserId(String userId, Pageable pageable);
    List<NodeTemplate> findByUserIdAndNodeType(String userId, String nodeType);
} 