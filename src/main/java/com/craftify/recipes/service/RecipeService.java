package com.craftify.recipes.service;

import com.craftify.recipes.document.RecipeDocument;
import com.craftify.recipes.dto.ApplyResponseDto;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.ResultingProductDto;
import com.craftify.recipes.dto.YieldResponseDto;
import com.craftify.recipes.repository.RecipeRepository;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import java.math.BigDecimal;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class RecipeService
    extends CrudServiceAbstract<RecipeDocument, RecipeDto, String, SearchFilter> {
  private final RecipeMappingService mappingService;
  private final RecipeYieldService recipeYieldService;
  private final RecipeApplyService recipeApplyService;

  public RecipeService(
          RecipeRepository repository,
          RecipeMappingService mappingService,
          RecipeYieldService recipeYieldService, RecipeApplyService recipeApplyService) {
    super(repository);
    this.mappingService = mappingService;
    this.recipeYieldService = recipeYieldService;
    this.recipeApplyService = recipeApplyService;
  }

  @Override
  protected RecipeDto toDto(RecipeDocument recipeDocument) throws ApiException {
    return mappingService.toDto(recipeDocument);
  }

  @Override
  protected RecipeDocument toEntity(RecipeDto dto) throws ApiException {
    return mappingService.toEntity(dto);
  }

  public YieldResponseDto getYieldByRecipeId(String recipeId, String currentUserId)
      throws ApiException {
    return recipeYieldService.calculateYieldByRecipeId(recipeId, currentUserId);
  }

  public ApplyResponseDto applyRecipeById(String recipeId, BigDecimal amount, String currentUserId)
          throws ApiException {
    var maxYield = recipeYieldService.calculateYieldByRecipeId(recipeId, currentUserId);
    var maxYieldValue = maxYield.getYield();
    if(amount.compareTo(maxYieldValue) > 0) {
      var responseDto = new ApplyResponseDto();
      responseDto.setRecipeId(recipeId);
      var issues = maxYield.getIssues();
      // Add a custom issue text indicating the issue with the amount
      issues.add("Requested amount " + amount + " exceeds the maximum possible yield of " + maxYieldValue + " for this recipe.");
      responseDto.setIssues(issues);
      return responseDto;
    }
    return recipeApplyService.applyRecipeById(recipeId, amount, currentUserId);
  }
}
