package com.craftify.recipes.document;

import com.craftify.shared.document.IdentifiedDocument;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "recipes")
public class RecipeDocument extends IdentifiedDocument<String> {
  private AvailabilityCheckLogic availabilityCheckLogic;
  private SubtractionLogic subtractionLogic;
  private ResultingProduct resultingProduct;

  public AvailabilityCheckLogic getAvailabilityCheckLogic() {
    return availabilityCheckLogic;
  }

  public void setAvailabilityCheckLogic(AvailabilityCheckLogic availabilityCheckLogic) {
    this.availabilityCheckLogic = availabilityCheckLogic;
  }

  public SubtractionLogic getSubtractionLogic() {
    return subtractionLogic;
  }

  public void setSubtractionLogic(SubtractionLogic subtractionLogic) {
    this.subtractionLogic = subtractionLogic;
  }

  public ResultingProduct getResultingProduct() {
    return resultingProduct;
  }

  public void setResultingProduct(ResultingProduct resultingProduct) {
    this.resultingProduct = resultingProduct;
  }
}
