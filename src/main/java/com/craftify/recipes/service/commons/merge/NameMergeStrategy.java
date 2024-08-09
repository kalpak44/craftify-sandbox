package com.craftify.recipes.service.commons.merge;

public class NameMergeStrategy implements MergeStrategy<String> {

  private Strategy strategy = Strategy.OVERRIDE;

  public Strategy getStrategy() {
    return strategy;
  }

  public void setStrategy(Strategy strategy) {
    this.strategy = strategy;
  }

  @Override
  public String merge(String original, String toMerge) {
    if (strategy == Strategy.OVERRIDE) {
      return toMerge;
    }
    return original;
  }

  public enum Strategy {
    KEEP_ORIGINAL,
    OVERRIDE
  }
}
