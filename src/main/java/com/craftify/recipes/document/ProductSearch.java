package com.craftify.recipes.document;

import java.util.HashMap;
import java.util.Map;

public class ProductSearch {
  private String productName;
  private Map<String, String> attributes = new HashMap<>();
  private Map<String, String> tags = new HashMap<>();

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
}
