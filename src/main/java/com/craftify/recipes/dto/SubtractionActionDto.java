package com.craftify.recipes.dto;

public class SubtractionActionDto extends ConditionDto {
  private SubtractionMeasurementDto measurement;

  public SubtractionMeasurementDto getMeasurement() {
    return measurement;
  }

  public void setMeasurement(SubtractionMeasurementDto measurement) {
    this.measurement = measurement;
  }
}
