package com.craftify.recipes.document;

import java.math.BigDecimal;

public class SubtractionMeasurement {
  private String type;
  private BigDecimal subtractAmount;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public BigDecimal getSubtractAmount() {
    return subtractAmount;
  }

  public void setSubtractAmount(BigDecimal subtractAmount) {
    this.subtractAmount = subtractAmount;
  }
}
