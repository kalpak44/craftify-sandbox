package com.craftify.recipes.dto;

import java.util.ArrayList;
import java.util.List;

public class ApplyResponseDto {
  private String recipeId;
  private List<String> issues = new ArrayList<>();

  public String getRecipeId() {
    return recipeId;
  }

  public void setRecipeId(String recipeId) {
    this.recipeId = recipeId;
  }

  public List<String> getIssues() {
    return issues;
  }

  public void setIssues(List<String> issues) {
    this.issues = issues;
  }
}
