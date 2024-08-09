package com.craftify.recipes.dto;

import java.util.List;

public class RecipeItemDto {
  private String ingredientName;
  private ProductSearchDto productSearch;
  private List<ActionDto> actions;
  private List<ActionDto> categories;

  public String getIngredientName() {
    return ingredientName;
  }

  public void setIngredientName(String ingredientName) {
    this.ingredientName = ingredientName;
  }

  public ProductSearchDto getProductSearch() {
    return productSearch;
  }

  public void setProductSearch(ProductSearchDto productSearch) {
    this.productSearch = productSearch;
  }

  public List<ActionDto> getActions() {
    return actions;
  }

  public void setActions(List<ActionDto> actions) {
    this.actions = actions;
  }

  public List<ActionDto> getCategories() {
    return categories;
  }

  public void setCategories(List<ActionDto> categories) {
    this.categories = categories;
  }
}
