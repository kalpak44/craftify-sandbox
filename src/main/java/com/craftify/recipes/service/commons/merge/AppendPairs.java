package com.craftify.recipes.service.commons.merge;

import com.craftify.recipes.models.Pair;

import java.math.BigDecimal;
import java.util.Map;

public interface AppendPairs {
    default void appendMissing(
            Map<String, Pair<BigDecimal, String>> base, Map<String, Pair<BigDecimal, String>> other) {
        for (String key : other.keySet()) {
            final Pair<BigDecimal, String> baseMap = base.get(key);
            other.putIfAbsent(key, baseMap);
        }
    }
}
