package com.craftify.recipes.service.commons.merge;

import java.util.Set;

public class CategoryMergeStrategy implements MergeStrategy<Set<String>> {

  private Strategy strategy = Strategy.APPEND_MISSING;

  public Strategy getStrategy() {
    return strategy;
  }

  public void setStrategy(Strategy strategy) {
    this.strategy = strategy;
  }

  @Override
  public Set<String> merge(Set<String> original, Set<String> toMerge) {
    return switch (strategy) {
      case OVERRIDE -> toMerge;
      case APPEND_MISSING -> {
        original.addAll(toMerge);
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
