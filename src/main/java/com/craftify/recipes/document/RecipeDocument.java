package com.craftify.recipes.document;

import com.craftify.shared.document.IdentifiedDocument;
import com.craftify.shared.document.UserDataDocument;
import java.util.List;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recipes")
public class RecipeDocument extends IdentifiedDocument<String> implements UserDataDocument {
  private String userId;
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

  @Override
  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }
}
