package com.craftify.recipes.service.commons.merge;

import com.craftify.recipes.models.Pair;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class MeasurementMergeStrategy
    implements MergeStrategy<Map<String, Pair<BigDecimal, String>>> {

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

  private void sumMeasurements(
      Map<String, Pair<BigDecimal, String>> base, Map<String, Pair<BigDecimal, String>> other) {
    for (String key : other.keySet()) {
      Pair<BigDecimal, String> basePair = base.getOrDefault(key, new Pair<>(BigDecimal.ZERO, ""));
      Pair<BigDecimal, String> otherPair = other.get(key);

      base.put(key, new Pair<>(basePair.getValue().add(otherPair.getValue()), basePair.getUnit()));
    }
  }

  private void appendMissing(
      Map<String, Pair<BigDecimal, String>> base, Map<String, Pair<BigDecimal, String>> other) {
/*    for (String key : other.keySet()) {
      Map<BigDecimal, String> baseMap = base.getOrDefault(key, new HashMap<>());
      Map<BigDecimal, String> otherMap = other.get(key);

      otherMap.forEach(baseMap::putIfAbsent);
      base.put(key, baseMap);
    }*/
  }

  public enum Strategy {
    KEEP_ORIGINAL,
    OVERRIDE,
    APPEND_MISSING,
    SUM
  }
}
