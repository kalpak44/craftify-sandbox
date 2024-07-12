package com.craftify.recipes.repository;

import com.craftify.recipes.document.RecipeDocument;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface RecipeRepository extends MongoRepository<RecipeDocument, String> {}
