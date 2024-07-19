package com.craftify.products.document;

import com.craftify.shared.document.IdentifiedDocument;
import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "products")
public class ProductDocument extends IdentifiedDocument<String> {

  private String name;
  private Map<String, String> tags = new HashMap<>();
  private Map<String, String> attributes = new HashMap<>();
  private Map<String, Map<BigDecimal, String>> measurements = new HashMap<>();
  private Map<String, Map<BigDecimal, String>> availability = new HashMap<>();
  private Set<String> categories = new HashSet<>();

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Map<String, String> getTags() {
    return tags;
  }

  public void setTags(Map<String, String> tags) {
    this.tags = tags;
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

  public Map<String, Map<BigDecimal, String>> getAvailability() {
    return availability;
  }

  public void setAvailability(Map<String, Map<BigDecimal, String>> availability) {
    this.availability = availability;
  }

  public Set<String> getCategories() {
    return categories;
  }

  public void setCategories(Set<String> categories) {
    this.categories = categories;
  }
}
