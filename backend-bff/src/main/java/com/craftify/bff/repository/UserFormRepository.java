package com.craftify.bff.repository;

import com.craftify.bff.model.DataStore;
import com.craftify.bff.model.Form;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserFormRepository extends MongoRepository<Form, String> {
    Page<Form> findAllByUserId(String userId, Pageable pageable);
    Optional<Form> findByIdAndUserId(String id, String userId);
}
