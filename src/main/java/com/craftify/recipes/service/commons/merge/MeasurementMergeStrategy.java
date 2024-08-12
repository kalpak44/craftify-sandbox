package com.craftify.recipes.service.commons.merge;

import com.craftify.recipes.models.Pair;

import java.math.BigDecimal;
import java.util.Map;

public class MeasurementMergeStrategy
    implements MergeStrategy<Map<String, Pair<BigDecimal, String>>>, SumPairs, AppendPairs {

  private Strategy strategy = Strategy.APPEND_MISSING;

  public Strategy getStrategy() {
    return strategy;
  }

  public void setStrategy(Strategy strategy) {
    this.strategy = strategy;
  }

  @Override
  public Map<String, Pair<BigDecimal, String>> merge(
      Map<String, Pair<BigDecimal, String>> original, Map<String, Pair<BigDecimal, String>> toMerge) {
    return switch (strategy) {
      case OVERRIDE -> toMerge;
      case APPEND_MISSING -> {
        appendMissing(original, toMerge);
        yield original;
      }
      case SUM -> {
        sumMeasurements(original, toMerge);
        yield original;
      }
      default -> original;
    };
  }


  public enum Strategy {
    KEEP_ORIGINAL,
    OVERRIDE,
    APPEND_MISSING,
    SUM
  }
}
