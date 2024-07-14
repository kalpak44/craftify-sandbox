package com.craftify.recipes.service;

import com.craftify.products.service.ProductSearchService;
import com.craftify.recipes.dto.ApplyRecipeResponseDto;
import com.craftify.recipes.dto.YieldResponseDto;
import com.craftify.recipes.repository.RecipeRepository;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class RecipeYieldService {

  private final RecipeRepository recipeRepository;
  private final ProductSearchService productSearchService;
  private final RecipeMappingService recipeMappingService;

  public RecipeYieldService(
      RecipeRepository recipeRepository,
      ProductSearchService productSearchService,
      RecipeMappingService recipeMappingService) {
    this.recipeRepository = recipeRepository;
    this.productSearchService = productSearchService;
    this.recipeMappingService = recipeMappingService;
  }

  public YieldResponseDto calculateYieldByRecipeId(String recipeId) {
    var yield = new YieldResponseDto();
    yield.setRecipeId(recipeId);

    var optionalRecipe = recipeRepository.findById(recipeId);
    if (optionalRecipe.isEmpty()) {
      yield.setIssues(List.of("Recipe not found"));
      yield.setPossibleProducts(0);
      return yield;
    }

    var recipe = optionalRecipe.get();
    var errors = new ArrayList<String>();
    var possibleProducts = BigDecimal.valueOf(Long.MAX_VALUE);

    for (var item : recipe.getRecipe()) {
      var productSearch = item.getProductSearch();
      var matchingProducts = productSearchService.searchProducts(productSearch);

      if (matchingProducts.isEmpty()) {
        errors.add("No matching products found for: " + productSearch.getProductName());
        possibleProducts = BigDecimal.ZERO;
        break;
      }

      for (var action : item.getActions()) {
        var requiredAmount = action.getMeasurement().getAmount();
        var requiredUnit = action.getMeasurement().getUnit();
        if (action.getType().equals("subtraction")
            && requiredAmount.compareTo(BigDecimal.ZERO) <= 0) {
          errors.add(
              "Measurement amount for "
                  + productSearch.getProductName()
                  + " must be greater than zero");
          possibleProducts = BigDecimal.ZERO;
          break;
        }

        var totalAvailable = BigDecimal.ZERO;
        var unitMatches = false;
        for (var product : matchingProducts) {
          var measurements = product.getMeasurements();
          var measurement = measurements.get(action.getMeasurement().getType());
          if (measurement != null) {
            for (var amount : measurement.keySet()) {
              if (measurement.get(amount).equals(requiredUnit)) {
                totalAvailable = totalAvailable.add(amount);
                unitMatches = true;
              } else {
                errors.add(
                    "Unit mismatch for "
                        + productSearch.getProductName()
                        + ": expected "
                        + requiredUnit
                        + ", found "
                        + measurement.get(amount));
              }
            }
          }
        }

        if (!unitMatches) {
          possibleProducts = BigDecimal.ZERO;
          break;
        }

        if (totalAvailable.compareTo(requiredAmount) < 0) {
          errors.add(
              "Insufficient amount of "
                  + productSearch.getProductName()
                  + " to produce the product");
          possibleProducts = BigDecimal.ZERO;
          break;
        }

        var productsFromThisItem = totalAvailable.divide(requiredAmount, RoundingMode.DOWN);
        if (productsFromThisItem.compareTo(possibleProducts) < 0) {
          possibleProducts = productsFromThisItem;
        }
      }
    }

    yield.setPossibleProducts(possibleProducts.intValue());
    if (!errors.isEmpty()) {
      yield.setIssues(errors);
    }

    return yield;
  }

  public ApplyRecipeResponseDto applyYieldByRecipeId(String recipeId, int count) {
    final var applyStatus = new ApplyRecipeResponseDto();
    applyStatus.setRecipeId(recipeId);
    applyStatus.setApplyCount(count);
    // todo: implement me
    return applyStatus;
  }
}
