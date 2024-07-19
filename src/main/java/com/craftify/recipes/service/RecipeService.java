package com.craftify.recipes.service;

import com.craftify.recipes.document.RecipeDocument;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.YieldResponseDto;
import com.craftify.recipes.repository.RecipeRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class RecipeService extends CrudServiceAbstract<RecipeDocument, RecipeDto, String> {
  private final RecipeMappingService mappingService;
  private final RecipeYieldService recipeYieldService;

  public RecipeService(
      RecipeRepository repository,
      RecipeMappingService mappingService,
      RecipeYieldService recipeYieldService) {
    super(repository);
    this.mappingService = mappingService;
    this.recipeYieldService = recipeYieldService;
  }

  @Override
  protected RecipeDto toDto(RecipeDocument recipeDocument) throws ApiException {
    return mappingService.toDto(recipeDocument);
  }

  @Override
  protected RecipeDocument toEntity(RecipeDto dto) throws ApiException {
    return mappingService.toEntity(dto);
  }

  public YieldResponseDto getYieldByRecipeId(String recipeId) throws ApiException {
    return recipeYieldService.calculateYieldByRecipeId(recipeId);
  }
}
