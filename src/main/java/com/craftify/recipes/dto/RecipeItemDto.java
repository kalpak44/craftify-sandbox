package com.craftify.recipes.dto;

import java.util.List;

public class RecipeItemDto {
  private ProductSearchDto productSearch;
  private List<ActionDto> actions;

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
}
