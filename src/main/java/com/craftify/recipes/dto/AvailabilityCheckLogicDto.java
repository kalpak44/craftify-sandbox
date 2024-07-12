package com.craftify.recipes.dto;

import java.util.Set;

public class AvailabilityCheckLogicDto {
  private Set<AvailabilityConditionDto> conditions;

  public Set<AvailabilityConditionDto> getConditions() {
    return conditions;
  }

  public void setConditions(Set<AvailabilityConditionDto> conditions) {
    this.conditions = conditions;
  }
}
