package com.craftify.recipes.dto;

import java.math.BigDecimal;

public class YieldResponseDto {
  private String recipeId;
  private int possibleProducts;

  public String getRecipeId() {
    return recipeId;
  }

  public void setRecipeId(String recipeId) {
    this.recipeId = recipeId;
  }

  public int getPossibleProducts() {
    return possibleProducts;
  }

  public void setPossibleProducts(int possibleProducts) {
    this.possibleProducts = possibleProducts;
  }
}
