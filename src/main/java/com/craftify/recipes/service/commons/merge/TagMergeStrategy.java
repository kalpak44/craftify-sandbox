package com.craftify.recipes.service.commons.merge;

import java.util.Map;

public class TagMergeStrategy implements MergeStrategy<Map<String, String>> {

  private Strategy strategy = Strategy.APPEND_MISSING;

  public Strategy getStrategy() {
    return strategy;
  }

  public void setStrategy(Strategy strategy) {
    this.strategy = strategy;
  }

  @Override
  public Map<String, String> merge(Map<String, String> original, Map<String, String> toMerge) {
    return switch (strategy) {
      case OVERRIDE -> toMerge;
      case APPEND_MISSING -> {
        original.putAll(toMerge);
        yield original;
      }
      default -> original;
    };
  }

  public enum Strategy {
    KEEP_ORIGINAL,
    OVERRIDE,
    APPEND_MISSING
  }
}
