package com.craftify.recipes.dto;

import com.craftify.shared.dto.IdentifiedDto;
import java.util.List;

public class RecipeDto extends IdentifiedDto<String> {
  private List<RecipeItemDto> recipe;
  private ResultingProductDto resultingProduct;

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
