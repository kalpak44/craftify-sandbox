package com.craftify.recipes.dto;

import java.util.ArrayList;
import java.util.List;

public class YieldResponseDto {
  private String recipeId;
  private int possibleProducts;
  private List<String> issues = new ArrayList<>();

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

  public List<String> getIssues() {
    return issues;
  }

  public void setIssues(List<String> issues) {
    this.issues = issues;
  }
}
