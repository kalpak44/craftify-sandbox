package com.craftify.recipes.service.actions;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.exception.RecipeActionError;
import com.craftify.shared.exception.ApiException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

public interface RecipeAction {
  String getType();

  void validateParameters(Map<String, Object> parameters) throws ApiException;

  BigDecimal calculateNewYield(
      List<ProductDocument> recipeStepProducts,
      Map<String, Object> actionParameters,
      BigDecimal currentYield)
      throws RecipeActionError;

  void apply(List<ProductDocument> matchingProducts, Map<String, Object> parameters, BigDecimal amount) throws RecipeActionError;
}
