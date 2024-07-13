package com.craftify.recipes.document;

import com.craftify.shared.document.IdentifiedDocument;
import java.util.List;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recipes")
public class RecipeDocument extends IdentifiedDocument<String> {
  private List<RecipeItem> recipe;
  private ResultingProduct resultingProduct;

  public List<RecipeItem> getRecipe() {
    return recipe;
  }

  public void setRecipe(List<RecipeItem> recipe) {
    this.recipe = recipe;
  }

  public ResultingProduct getResultingProduct() {
    return resultingProduct;
  }

  public void setResultingProduct(ResultingProduct resultingProduct) {
    this.resultingProduct = resultingProduct;
  }
}
