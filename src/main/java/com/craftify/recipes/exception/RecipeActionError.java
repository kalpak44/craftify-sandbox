package com.craftify.recipes.exception;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

public class RecipeActionError extends Exception {
  private final BigDecimal newYield;
  private final List<String> errors;

  public RecipeActionError(String message, BigDecimal newYield) {
    super(message);
    this.newYield = newYield;
    this.errors = new ArrayList<>();
  }

  public RecipeActionError(String message) {
    super(message);
    this.newYield = BigDecimal.ZERO;
    this.errors = new ArrayList<>();
  }

  public RecipeActionError(List<String> errors) {
    super(String.join("; ", errors));
    this.newYield = BigDecimal.ZERO;
    this.errors = errors;
  }

  public BigDecimal getNewYield() {
    return newYield;
  }

  public List<String> getErrors() {
    return errors;
  }
}
