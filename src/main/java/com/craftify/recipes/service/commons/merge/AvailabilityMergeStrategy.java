package com.craftify.recipes.service.commons.merge;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

public class AvailabilityMergeStrategy
    implements MergeStrategy<Map<String, Map<BigDecimal, String>>> {

  private Strategy strategy = Strategy.SUM;

  public Strategy getStrategy() {
    return strategy;
  }

  public void setStrategy(Strategy strategy) {
    this.strategy = strategy;
  }

  @Override
  public Map<String, Map<BigDecimal, String>> merge(
      Map<String, Map<BigDecimal, String>> original, Map<String, Map<BigDecimal, String>> toMerge) {
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
      Map<String, Map<BigDecimal, String>> base, Map<String, Map<BigDecimal, String>> other) {
    for (String key : other.keySet()) {
      Map<BigDecimal, String> baseMap = base.getOrDefault(key, new HashMap<>());
      Map<BigDecimal, String> otherMap = other.get(key);

      for (BigDecimal amount : otherMap.keySet()) {
        baseMap.merge(
            amount,
            otherMap.get(amount),
            (v1, v2) -> {
              BigDecimal sum = amount.add(amount);
              return sum + " " + v1;
            });
      }

      base.put(key, baseMap);
    }
  }

  private void appendMissing(
      Map<String, Map<BigDecimal, String>> base, Map<String, Map<BigDecimal, String>> other) {
    for (String key : other.keySet()) {
      Map<BigDecimal, String> baseMap = base.getOrDefault(key, new HashMap<>());
      Map<BigDecimal, String> otherMap = other.get(key);

      otherMap.forEach(baseMap::putIfAbsent);
      base.put(key, baseMap);
    }
  }

  public enum Strategy {
    KEEP_ORIGINAL,
    OVERRIDE,
    APPEND_MISSING,
    SUM
  }
}
