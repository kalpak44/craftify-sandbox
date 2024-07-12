package com.craftify.recipes.dto;

import java.util.Set;

public class AvailabilityConditionDto extends ConditionDto {
  private Set<MeasurementDto> measurements;

  public Set<MeasurementDto> getMeasurements() {
    return measurements;
  }

  public void setMeasurements(Set<MeasurementDto> measurements) {
    this.measurements = measurements;
  }
}
