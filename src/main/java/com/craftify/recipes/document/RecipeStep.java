package com.craftify.recipes.document;

import java.util.List;

public class RecipeStep {
  private ProductSearch productSearch;
  private List<Action> actions;

  public ProductSearch getProductSearch() {
    return productSearch;
  }

  public void setProductSearch(ProductSearch productSearch) {
    this.productSearch = productSearch;
  }

  public List<Action> getActions() {
    return actions;
  }

  public void setActions(List<Action> actions) {
    this.actions = actions;
  }
}
