package com.craftify.recipes.dto;

import com.craftify.shared.dto.IdentifiedDto;

public class RecipeDto extends IdentifiedDto<String> {
  private AvailabilityCheckLogicDto availabilityCheckLogic;
  private SubtractionLogicDto subtractionLogic;
  private ResultingProductDto resultingProduct;

  public AvailabilityCheckLogicDto getAvailabilityCheckLogic() {
    return availabilityCheckLogic;
  }

  public void setAvailabilityCheckLogic(AvailabilityCheckLogicDto availabilityCheckLogic) {
    this.availabilityCheckLogic = availabilityCheckLogic;
  }

  public SubtractionLogicDto getSubtractionLogic() {
    return subtractionLogic;
  }

  public void setSubtractionLogic(SubtractionLogicDto subtractionLogic) {
    this.subtractionLogic = subtractionLogic;
  }

  public ResultingProductDto getResultingProduct() {
    return resultingProduct;
  }

  public void setResultingProduct(ResultingProductDto resultingProduct) {
    this.resultingProduct = resultingProduct;
  }
}
