package com.craftify.recipes.repository;

import com.craftify.recipes.document.RecipeDocument;
import com.craftify.shared.repository.UserDataRepository;

public interface RecipeRepository extends UserDataRepository<RecipeDocument, String> {}
