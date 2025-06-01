package com.craftify.notebooks;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface NotebookRepository extends MongoRepository<Notebook, String> {
    Page<Notebook> findByUserId(String userId, Pageable pageable);
}
