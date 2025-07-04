package com.craftify.schema;

import java.util.HashMap;
import java.util.Map;

class DynamicComponent implements Component {
    private final String type;
    private final Map<String, Field> fields = new HashMap<>();

    public DynamicComponent(String type) {
        this.type = type;
    }

    public void set(String key, FieldType type, Object value, ValidationRule rule) {
        fields.put(key, new Field(type, value, rule));
    }

    public Object get(String key) {
        return fields.containsKey(key) ? fields.get(key).getValue() : null;
    }

    public Map<String, Field> getAllFields() {
        return fields;
    }

    @Override
    public String toString() {
        return type + fields.toString();
    }
}
