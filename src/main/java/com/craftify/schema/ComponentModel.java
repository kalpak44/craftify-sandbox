package com.craftify.schema;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

class ComponentModel {
    private final String type;
    private final Map<String, FieldSpec> fieldSpecs = new LinkedHashMap<>();
    private final Map<String, ComponentModel> nestedModels = new LinkedHashMap<>();


    public ComponentModel(String type) {
        this.type = type;
    }

    public ComponentModel field(String name, FieldType type, ValidationRule rule, ComponentModel nested) {
        fieldSpecs.put(name, new FieldSpec(type, rule));
        if (type == FieldType.OBJECT && nested != null) {
            nestedModels.put(name, nested);
        }
        return this;
    }

    public DynamicComponent createInstance(Map<String, Object> input) {
        DynamicComponent component = new DynamicComponent(type);

        for (Map.Entry<String, FieldSpec> entry : fieldSpecs.entrySet()) {
            String fieldName = entry.getKey();
            FieldSpec spec = entry.getValue();
            Object value = input.get(fieldName);

            if (spec.getType() == FieldType.ARRAY && value instanceof List<?> list) {
                List<Object> validatedList = new ArrayList<>();
                ComponentModel itemModel = nestedModels.get(fieldName);
                for (Object item : list) {
                    if (itemModel != null && item instanceof Map<?, ?> itemMap) {
                        DynamicComponent dc = itemModel.createInstance((Map<String, Object>) itemMap);
                        validatedList.add(dc);
                    } else {
                        validatedList.add(item); // primitive item like String/Number/Boolean
                    }
                }
                value = validatedList;
            } else if (spec.getType() == FieldType.OBJECT && value instanceof Map nestedMap) {
                ComponentModel nestedModel = nestedModels.get(fieldName);
                if (nestedModel == null) {
                    throw new ValidationException("No nested schema defined for field '" + fieldName + "'");
                }
                value = nestedModel.createInstance(nestedMap);
            }

            if (!spec.isValid(value)) {
                throw new ValidationException("Invalid value for field '" + fieldName + "': " + spec.getLastError());
            }

            component.set(fieldName, spec.getType(), value, spec.getValidation());
        }

        return component;
    }

    private static class FieldSpec {
        private final FieldType type;
        private final ValidationRule validation;
        private String lastError;

        public FieldSpec(FieldType type, ValidationRule validation) {
            this.type = type;
            this.validation = validation;
        }

        public boolean isValid(Object value) {
            lastError = validation.validate(type, value);
            return lastError == null;
        }

        public String getLastError() {
            return lastError;
        }

        public FieldType getType() {
            return type;
        }

        public ValidationRule getValidation() {
            return validation;
        }
    }
}

