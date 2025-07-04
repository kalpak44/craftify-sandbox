package com.craftify.schema;

import java.util.List;
import java.util.regex.Pattern;

class ValidationRule {
    public boolean required;
    public Integer minLength, maxLength;
    public String regex;
    public Double min, max;
    public boolean notEmpty;

    public String validate(FieldType type, Object value) {
        if (required && value == null) return "Field is required";
        if (value == null) return null;
        return switch (type) {
            case STRING -> validateString(value);
            case NUMBER -> validateNumber(value);
            case ARRAY -> validateArray(value);
            default -> null;
        };
    }

    private String validateString(Object value) {
        if (!(value instanceof String s)) return "Not a string";
        if (minLength != null && s.length() < minLength) return "Too short";
        if (maxLength != null && s.length() > maxLength) return "Too long";
        if (regex != null && !Pattern.compile(regex).matcher(s).matches()) return "Regex mismatch";
        return null;
    }

    private String validateNumber(Object value) {
        if (!(value instanceof Number n)) return "Not a number";
        double d = n.doubleValue();
        if (min != null && d < min) return "Below min";
        if (max != null && d > max) return "Above max";
        return null;
    }

    private String validateArray(Object value) {
        if (!(value instanceof List<?> list)) return "Not an array";
        if (notEmpty && list.isEmpty()) return "Array must not be empty";
        return null;
    }
}
