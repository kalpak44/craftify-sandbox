package com.craftify.recipes.dto;

import java.math.BigDecimal;

public class ApplyRequestDto {
  private BigDecimal amount = BigDecimal.ONE;

  public BigDecimal getAmount() {
    return amount;
  }

  public void setAmount(BigDecimal amount) {
    this.amount = amount;
  }
}
