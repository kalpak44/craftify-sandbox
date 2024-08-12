package com.craftify.recipes.service.commons.merge;

import com.craftify.recipes.models.Pair;

import java.math.BigDecimal;
import java.util.Map;

public interface SumPairs {
    default void sumMeasurements(
            Map<String, Pair<BigDecimal, String>> base, Map<String, Pair<BigDecimal, String>> other) {
        for (String key : other.keySet()) {
            final Pair<BigDecimal, String> basePair = base.get(key);
            final Pair<BigDecimal, String> otherPair = other.get(key);

            if(basePair != null && otherPair != null){
                var sum = basePair.getValue().add(otherPair.getValue());
                base.put(key, new Pair<>(sum, basePair.getUnit()));
            } else {
                throw new IllegalArgumentException("basePair and otherPair must be not null");
            }
        }
    }
}
