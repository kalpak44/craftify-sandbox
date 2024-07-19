package com.craftify.recipes.document;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ProductSearch {
  private String productName;
  private Map<String, String> attributes = new HashMap<>();
  private Map<String, Map<BigDecimal, String>> measurements = new HashMap<>();
  private Map<String, String> tags = new HashMap<>();
  private Set<String> categories = new HashSet<>();

  public String getProductName() {
    return productName;
  }

  public void setProductName(String productName) {
    this.productName = productName;
  }

  public Map<String, String> getAttributes() {
    return attributes;
  }

  public void setAttributes(Map<String, String> attributes) {
    this.attributes = attributes;
  }

  public Map<String, String> getTags() {
    return tags;
  }

  public void setTags(Map<String, String> tags) {
    this.tags = tags;
  }

  public Map<String, Map<BigDecimal, String>> getMeasurements() {
    return measurements;
  }

  public void setMeasurements(Map<String, Map<BigDecimal, String>> measurements) {
    this.measurements = measurements;
  }

  public Set<String> getCategories() {
    return categories;
  }

  public void setCategories(Set<String> categories) {
    this.categories = categories;
  }
}
