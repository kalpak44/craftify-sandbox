package com.craftify.recipes.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class YieldResponseDto {
  private String recipeId;
  private BigDecimal yield;
  private List<String> issues = new ArrayList<>();

  public String getRecipeId() {
    return recipeId;
  }

  public void setRecipeId(String recipeId) {
    this.recipeId = recipeId;
  }

  public BigDecimal getYield() {
    return yield;
  }

  public void setYield(BigDecimal yield) {
    this.yield = yield;
  }

  public List<String> getIssues() {
    return issues;
  }

  public void setIssues(List<String> issues) {
    this.issues = issues;
  }
}
