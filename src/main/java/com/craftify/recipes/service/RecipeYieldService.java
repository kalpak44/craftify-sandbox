package com.craftify.recipes.service;

import com.craftify.products.service.ProductSearchService;
import com.craftify.recipes.dto.YieldResponseDto;
import com.craftify.recipes.exception.RecipeActionError;
import com.craftify.recipes.repository.RecipeRepository;
import com.craftify.recipes.service.actions.RecipeAction;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import org.springframework.stereotype.Service;

@Service
public class RecipeYieldService {

  private final RecipeRepository recipeRepository;
  private final ProductSearchService productSearchService;
  private final Set<RecipeAction> allAvailableRecipeActions;

  public RecipeYieldService(
      RecipeRepository recipeRepository,
      ProductSearchService productSearchService,
      Set<RecipeAction> recipeActions) {
    this.recipeRepository = recipeRepository;
    this.productSearchService = productSearchService;
    this.allAvailableRecipeActions = recipeActions;
  }

  public YieldResponseDto calculateYieldByRecipeId(String recipeId, String currentUserId) {
    var yield = new YieldResponseDto();
    yield.setRecipeId(recipeId);

    var optionalRecipe = recipeRepository.findById(recipeId);
    if (optionalRecipe.isEmpty()) {
      yield.setIssues(List.of("Recipe not found"));
      yield.setYield(null);
      return yield;
    }
    var recipeDocument = optionalRecipe.get();
    var resultErrors = new ArrayList<String>();
    var resultYield = BigDecimal.valueOf(Integer.MAX_VALUE);

    for (var recipeStep : recipeDocument.getRecipeSteps()) {
      var productSearch = recipeStep.getProductSearch();
      var matchingProducts = productSearchService.searchProducts(productSearch);

      if (matchingProducts.isEmpty()) {
        resultErrors.add("No matching products found for: " + productSearch.getProductName());
        continue;
      }

      for (var action : recipeStep.getActions()) {
        var recipeActions =
            allAvailableRecipeActions.stream()
                .filter(supportedActions -> action.getType().equals(supportedActions.getType()))
                .toList();

        for (var recipeAction : recipeActions) {
          try {
            resultYield =
                recipeAction.calculateNewYield(
                    matchingProducts, action.getParameters(), resultYield);
          } catch (RecipeActionError e) {
            resultErrors.addAll(e.getErrors());
          }
        }
      }
    }

    if (!resultErrors.isEmpty()) {
      yield.setYield(BigDecimal.ZERO);
      yield.setIssues(resultErrors);
    } else {
      yield.setYield(resultYield);
    }

    return yield;
  }
}
