package com.craftify.recipes.dto;

import com.craftify.recipes.models.Pair;
import com.craftify.recipes.service.commons.merge.AttributeMergeStrategy;
import com.craftify.recipes.service.commons.merge.AvailabilityMergeStrategy;
import com.craftify.recipes.service.commons.merge.CategoryMergeStrategy;
import com.craftify.recipes.service.commons.merge.MeasurementMergeStrategy;
import com.craftify.recipes.service.commons.merge.NameMergeStrategy;
import com.craftify.recipes.service.commons.merge.TagMergeStrategy;
import com.craftify.shared.dto.ResultMode;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;

public class ResultingProductDto {
  private ResultMode mode = ResultMode.CREATE_NEW;
  private String id;
  private NameMergeStrategy nameMergeStrategy = new NameMergeStrategy();
  private String name;
  private TagMergeStrategy tagMergeStrategy = new TagMergeStrategy();
  private Map<String, String> tags = new HashMap<>();
  private AttributeMergeStrategy attributeMergeStrategy = new AttributeMergeStrategy();
  private Map<String, String> attributes = new HashMap<>();
  private MeasurementMergeStrategy measurementMergeStrategy = new MeasurementMergeStrategy();
  private Map<String, Pair<BigDecimal, String>> measurements = new HashMap<>();
  private AvailabilityMergeStrategy availabilityMergeStrategy = new AvailabilityMergeStrategy();
  private Map<String, Pair<BigDecimal, String>> availability = new HashMap<>();
  private CategoryMergeStrategy categoryMergeStrategy = new CategoryMergeStrategy();
  private Set<String> categories = new HashSet<>();

  public String getId() {
    return id;
  }

  public void setId(String id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public ResultMode getMode() {
    return mode;
  }

  public void setMode(ResultMode mode) {
    this.mode = mode;
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

  public Map<String, Pair<BigDecimal, String>> getMeasurements() {
    return measurements;
  }

  public void setMeasurements(Map<String, Pair<BigDecimal, String>> measurements) {
    this.measurements = measurements;
  }

  public Map<String, Pair<BigDecimal, String>> getAvailability() {
    return availability;
  }

  public void setAvailability(Map<String, Pair<BigDecimal, String>> availability) {
    this.availability = availability;
  }

  public Set<String> getCategories() {
    return categories;
  }

  public void setCategories(Set<String> categories) {
    this.categories = categories;
  }

  public NameMergeStrategy getNameMergeStrategy() {
    return nameMergeStrategy;
  }

  public void setNameMergeStrategy(NameMergeStrategy nameMergeStrategy) {
    this.nameMergeStrategy = nameMergeStrategy;
  }

  public TagMergeStrategy getTagMergeStrategy() {
    return tagMergeStrategy;
  }

  public void setTagMergeStrategy(TagMergeStrategy tagMergeStrategy) {
    this.tagMergeStrategy = tagMergeStrategy;
  }

  public AttributeMergeStrategy getAttributeMergeStrategy() {
    return attributeMergeStrategy;
  }

  public void setAttributeMergeStrategy(AttributeMergeStrategy attributeMergeStrategy) {
    this.attributeMergeStrategy = attributeMergeStrategy;
  }

  public MeasurementMergeStrategy getMeasurementMergeStrategy() {
    return measurementMergeStrategy;
  }

  public void setMeasurementMergeStrategy(MeasurementMergeStrategy measurementMergeStrategy) {
    this.measurementMergeStrategy = measurementMergeStrategy;
  }

  public AvailabilityMergeStrategy getAvailabilityMergeStrategy() {
    return availabilityMergeStrategy;
  }

  public void setAvailabilityMergeStrategy(AvailabilityMergeStrategy availabilityMergeStrategy) {
    this.availabilityMergeStrategy = availabilityMergeStrategy;
  }

  public CategoryMergeStrategy getCategoryMergeStrategy() {
    return categoryMergeStrategy;
  }

  public void setCategoryMergeStrategy(CategoryMergeStrategy categoryMergeStrategy) {
    this.categoryMergeStrategy = categoryMergeStrategy;
  }
}
