package com.craftify.recipes.service;

import com.craftify.recipes.dto.ResultingProductDto;
import org.springframework.stereotype.Service;

@Service
public class ProductMergeService {
  public ResultingProductDto mergeProducts(
      ResultingProductDto original, ResultingProductDto toMerge) {
    // Apply name merge strategy
    original.setName(original.getNameMergeStrategy().merge(original.getName(), toMerge.getName()));

    // Apply category merge strategy
    original.setCategories(
        original
            .getCategoryMergeStrategy()
            .merge(original.getCategories(), toMerge.getCategories()));

    // Apply tag merge strategy
    original.setTags(original.getTagMergeStrategy().merge(original.getTags(), toMerge.getTags()));

    // Apply attribute merge strategy
    original.setAttributes(
        original
            .getAttributeMergeStrategy()
            .merge(original.getAttributes(), toMerge.getAttributes()));

    // Apply measurement merge strategy
    original.setMeasurements(
        original
            .getMeasurementMergeStrategy()
            .merge(original.getMeasurements(), toMerge.getMeasurements()));

    // Apply availability merge strategy
    original.setAvailability(
        original
            .getAvailabilityMergeStrategy()
            .merge(original.getAvailability(), toMerge.getAvailability()));

    return original;
  }
}
