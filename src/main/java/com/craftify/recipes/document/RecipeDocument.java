package com.craftify.recipes.document;

import com.craftify.shared.document.IdentifiedDocument;
import java.util.List;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recipes")
public class RecipeDocument extends IdentifiedDocument<String> {
  private List<RecipeStep> recipeSteps;
  private ResultingProduct resultingProduct;

  public List<RecipeStep> getRecipeSteps() {
    return recipeSteps;
  }

  public void setRecipeSteps(List<RecipeStep> recipeSteps) {
    this.recipeSteps = recipeSteps;
  }

  public ResultingProduct getResultingProduct() {
    return resultingProduct;
  }

  public void setResultingProduct(ResultingProduct resultingProduct) {
    this.resultingProduct = resultingProduct;
  }
}
