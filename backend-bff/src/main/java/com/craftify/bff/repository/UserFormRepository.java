package com.craftify.bff.repository;

import com.craftify.bff.model.Form;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserFormRepository extends MongoRepository<Form, String> {
    Page<Form> findAllByUserId(String userId, Pageable pageable);
}
