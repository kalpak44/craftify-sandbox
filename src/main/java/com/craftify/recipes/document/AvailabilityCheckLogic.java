package com.craftify.recipes.document;

import java.util.Set;

public class AvailabilityCheckLogic {
  private Set<AvailabilityCondition> conditions;

  public Set<AvailabilityCondition> getConditions() {
    return conditions;
  }

  public void setConditions(Set<AvailabilityCondition> conditions) {
    this.conditions = conditions;
  }
}
