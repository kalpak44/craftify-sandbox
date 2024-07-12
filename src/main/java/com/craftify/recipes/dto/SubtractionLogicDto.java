package com.craftify.recipes.dto;

import java.util.Set;

public class SubtractionLogicDto {
  private Set<SubtractionActionDto> actions;

  public Set<SubtractionActionDto> getActions() {
    return actions;
  }

  public void setActions(Set<SubtractionActionDto> actions) {
    this.actions = actions;
  }
}
