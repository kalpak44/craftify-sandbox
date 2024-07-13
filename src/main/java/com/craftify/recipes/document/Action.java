package com.craftify.recipes.document;

public class Action {
  private String type;
  private Measurement measurement;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Measurement getMeasurement() {
    return measurement;
  }

  public void setMeasurement(Measurement measurement) {
    this.measurement = measurement;
  }
}
