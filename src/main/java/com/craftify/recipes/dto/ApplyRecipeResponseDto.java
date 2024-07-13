package com.craftify.recipes.dto;

import java.math.BigDecimal;

public class ApplyRecipeResponseDto {
  private String recipeId;
  private int applyCount;
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

  public int getApplyCount() {
    return applyCount;
  }

  public void setApplyCount(int applyCount) {
    this.applyCount = applyCount;
  }
}
