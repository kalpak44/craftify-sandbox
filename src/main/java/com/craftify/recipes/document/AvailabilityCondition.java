package com.craftify.recipes.document;

import java.util.Set;

public class AvailabilityCondition extends Condition {
  private Set<Measurement> measurements;

  public Set<Measurement> getMeasurements() {
    return measurements;
  }

  public void setMeasurements(Set<Measurement> measurements) {
    this.measurements = measurements;
  }
}
