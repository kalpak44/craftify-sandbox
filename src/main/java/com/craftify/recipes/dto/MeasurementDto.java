package com.craftify.recipes.dto;

import java.math.BigDecimal;

public class MeasurementDto {
  private String type;
  private BigDecimal amount;
  private String unit;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }

  public String getUnit() {
    return unit;
  }

  public void setUnit(String unit) {
    this.unit = unit;
  }
}
