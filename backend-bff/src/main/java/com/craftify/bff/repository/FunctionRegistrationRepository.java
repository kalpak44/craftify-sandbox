package com.craftify.bff.repository;

import com.craftify.bff.model.FunctionRegistration;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FunctionRegistrationRepository extends MongoRepository<FunctionRegistration, String> {
    Page<FunctionRegistration> findAllByUserId(String userId, Pageable pageable);
    void deleteByIdAndUserId(String id, String userId);
}