package com.craftify.recipes.document;

import java.util.HashMap;
import java.util.Map;

public class Action {
  private String type;
  private Map<String, Object> parameters = new HashMap<>();

  public String getType() {
    return type;
  }

  public void setType(String type) {
    this.type = type;
  }

  public Map<String, Object> getParameters() {
    return parameters;
  }

  public void setParameters(Map<String, Object> parameters) {
    this.parameters = parameters;
  }
}
