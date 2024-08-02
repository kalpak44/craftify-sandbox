package com.craftify.recipes.dto;

import com.craftify.shared.dto.IdentifiedDto;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class RecipeDto extends IdentifiedDto<String> {
  @NotNull
  private String recipeName;
  private List<RecipeItemDto> recipe;
  private ResultingProductDto resultingProduct;

  public String getRecipeName() {
    return recipeName;
  }

  public void setRecipeName(String recipeName) {
    this.recipeName = recipeName;
  }

  public List<RecipeItemDto> getRecipe() {
    return recipe;
  }

  public void setRecipe(List<RecipeItemDto> recipe) {
    this.recipe = recipe;
  }

  public ResultingProductDto getResultingProduct() {
    return resultingProduct;
  }

  public void setResultingProduct(ResultingProductDto resultingProduct) {
    this.resultingProduct = resultingProduct;
  }
}
