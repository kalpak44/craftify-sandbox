package com.craftify.schema;

import java.util.List;

class Field {
    private final FieldType type;
    private Object value;
    private final ValidationRule validation;

    public Field(FieldType type, Object value, ValidationRule validation) {
        this.type = type;
        this.validation = validation;
        setValue(value);
    }

    public Object getValue() { return value; }

    public FieldType getType() { return type; }

    public void setValue(Object newValue) {
        if (!validateType(type, newValue))
            throw new IllegalArgumentException("Invalid type for value: " + newValue);
        String error = validation.validate(type, newValue);
        if (error != null)
            throw new ValidationException("Validation failed: " + error);
        this.value = newValue;
    }

    private boolean validateType(FieldType type, Object val) {
        return switch (type) {
            case STRING -> val instanceof String;
            case NUMBER -> val instanceof Number;
            case BOOLEAN -> val instanceof Boolean;
            case OBJECT -> val instanceof DynamicComponent;
            case ARRAY -> val instanceof List<?>;
        };
    }

    public ValidationRule getValidation() {
        return validation;
    }

    @Override
    public String toString() {
        return "(" + type + ") " + value;
    }
}