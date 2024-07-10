package com.craftify.categories.repository;

import com.craftify.categories.document.CategoryDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface CategoryRepository extends MongoRepository<CategoryDocument, String> {}
