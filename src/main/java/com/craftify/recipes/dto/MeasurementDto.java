package com.craftify.recipes.dto;

import java.math.BigDecimal;

public class MeasurementDto {
  private String type;
  private BigDecimal requiredAmount;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public BigDecimal getRequiredAmount() {
    return requiredAmount;
  }

  public void setRequiredAmount(BigDecimal requiredAmount) {
    this.requiredAmount = requiredAmount;
  }
}
