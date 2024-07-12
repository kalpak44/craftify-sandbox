package com.craftify.products.dto;

import com.craftify.shared.dto.IdentifiedDto;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class ProductDto extends IdentifiedDto<String> {
  private String name;
  private Map<String, String> attributes = new HashMap<>();
  private Map<String, Map<BigDecimal, String>> measurements = new HashMap<>();
  private Map<String, String> tags = new HashMap<>();


  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Map<String, String> getAttributes() {
    return attributes;
  }

  public void setAttributes(Map<String, String> attributes) {
    this.attributes = attributes;
  }

  public Map<String, Map<BigDecimal, String>> getMeasurements() {
    return measurements;
  }

  public void setMeasurements(Map<String, Map<BigDecimal, String>> measurements) {
    this.measurements = measurements;
  }

  public Map<String, String> getTags() {
    return tags;
  }

  public void setTags(Map<String, String> tags) {
    this.tags = tags;
  }
}
