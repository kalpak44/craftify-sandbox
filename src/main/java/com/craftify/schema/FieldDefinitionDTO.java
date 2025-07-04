package com.craftify.schema;

import java.util.Map;

public class FieldDefinitionDTO {
    public String type;
    public Boolean required;
    public Integer minLength;
    public Integer maxLength;
    public String regex;
    public Double min;
    public Double max;
    public Boolean notEmpty;

    // For ARRAY of OBJECTs
    public String itemType; // e.g., "OBJECT"
    public Map<String, FieldDefinitionDTO> fields;
}
