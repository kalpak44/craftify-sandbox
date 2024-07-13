package com.craftify.recipes.dto;

import java.math.BigDecimal;

public class YieldResponseDto {
  private String recipeId;
  private BigDecimal possibleProducts;

  public String getRecipeId() {
    return recipeId;
  }

  public void setRecipeId(String recipeId) {
    this.recipeId = recipeId;
  }

  public BigDecimal getPossibleProducts() {
    return possibleProducts;
  }

  public void setPossibleProducts(BigDecimal possibleProducts) {
    this.possibleProducts = possibleProducts;
  }
}
