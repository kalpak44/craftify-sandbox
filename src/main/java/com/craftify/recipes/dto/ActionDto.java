package com.craftify.recipes.dto;

public class ActionDto {
  private String type;
  private MeasurementDto measurement;

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public MeasurementDto getMeasurement() {
    return measurement;
  }

  public void setMeasurement(MeasurementDto measurement) {
    this.measurement = measurement;
  }
}
