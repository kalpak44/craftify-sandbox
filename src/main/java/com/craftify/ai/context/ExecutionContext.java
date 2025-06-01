package com.craftify.ai.context;


import java.util.HashMap;
import java.util.Map;

/**
 * Shared context for passing data between plan steps.
 * Stores intermediate values under named keys (e.g., "code1", "result1").
 */
public class ExecutionContext {
    private final Map<String, String> data = new HashMap<>();

    /**
     * Stores a value under a given key.
     *
     * @param key   key for this value
     * @param value string content to store
     */
    public void put(String key, String value) {
        data.put(key, value);
    }

    /**
     * Retrieves a value by key. Returns empty string if not found.
     *
     * @param key key to look up
     * @return value or empty string
     */
    public String get(String key) {
        return data.getOrDefault(key, "");
    }

    /**
     * Returns an unmodifiable view of the internal map.
     */
    public Map<String, String> all() {
        return Map.copyOf(data);
    }

    @Override
    public String toString() {
        return data.toString();
    }
}
