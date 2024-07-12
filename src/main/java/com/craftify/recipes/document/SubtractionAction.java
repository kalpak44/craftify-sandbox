package com.craftify.recipes.document;

public class SubtractionAction extends Condition {
  private SubtractionMeasurement measurement;

  public SubtractionMeasurement getMeasurement() {
    return measurement;
  }

  public void setMeasurement(SubtractionMeasurement measurement) {
    this.measurement = measurement;
  }
}
