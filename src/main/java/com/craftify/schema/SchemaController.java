package com.craftify.schema;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/schema")
public class SchemaController {
    private final Map<String, ComponentModel> modelRegistry = new ConcurrentHashMap<>();
    private final Map<String, List<Map<String, Object>>> savedData = new ConcurrentHashMap<>();
    private final ObjectMapper mapper = new ObjectMapper()
            .enable(SerializationFeature.INDENT_OUTPUT)
            .setSerializationInclusion(JsonInclude.Include.NON_NULL);

    @PostMapping("/create/{type}")
    public ResponseEntity<String> createSchema(@PathVariable String type, @RequestBody SchemaRequestDTO dto) {
        try {
            ComponentModel model = buildComponentModel(type, dto.fields);
            modelRegistry.put(type, model);
            return ResponseEntity.ok("✅ Schema created for type: " + type);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("❌ Failed to create schema: " + e.getMessage());
        }
    }


    @PostMapping("/save/{type}")
    public ResponseEntity<String> saveData(@PathVariable String type, @RequestBody Map<String, Object> payload) {
        try {
            ComponentModel model = modelRegistry.get(type);
            if (model == null)
                return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Schema not found for type: " + type);

            DynamicComponent obj = model.createInstance(payload);

            // Store data
            savedData.computeIfAbsent(type, k -> new ArrayList<>()).add(payload);

            String json = mapper.writeValueAsString(Map.of(
                    "schema", type,
                    "data", payload
            ));

            System.out.println("📦 Saving to DB (simulated):\n" + json);
            return ResponseEntity.ok("✅ Object validated and saved");
        } catch (ValidationException e) {
            return ResponseEntity.badRequest().body("❌ Validation failed: " + e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("❌ Error: " + e.getMessage());
        }
    }

    @GetMapping("/list")
    public ResponseEntity<List<String>> listSchemas() {
        return ResponseEntity.ok(new ArrayList<>(modelRegistry.keySet()));
    }

    @GetMapping("/data/{type}")
    public ResponseEntity<Object> listDataByType(@PathVariable String type) {
        List<Map<String, Object>> data = savedData.get(type);
        if (data == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("❌ No data found for type: " + type);
        }
        return ResponseEntity.ok(data);
    }

    private ComponentModel buildComponentModel(String type, Map<String, FieldDefinitionDTO> fields) {
        ComponentModel model = new ComponentModel(type);
        for (Map.Entry<String, FieldDefinitionDTO> entry : fields.entrySet()) {
            String fieldName = entry.getKey();
            FieldDefinitionDTO def = entry.getValue();
            FieldType fieldType = FieldType.valueOf(def.type.toUpperCase());

            ValidationRule rule = new ValidationRule();
            rule.required = Boolean.TRUE.equals(def.required);
            rule.min = def.min;
            rule.max = def.max;
            rule.minLength = def.minLength;
            rule.maxLength = def.maxLength;
            rule.regex = def.regex;
            rule.notEmpty = Boolean.TRUE.equals(def.notEmpty);

            if (fieldType == FieldType.ARRAY &&FieldType.OBJECT == FieldType.valueOf(def.itemType.toUpperCase()) && def.fields != null) {
                ComponentModel itemModel = buildComponentModel(fieldName + "[]", def.fields);
                model.field(fieldName, FieldType.ARRAY, rule, itemModel);
            } else if (fieldType == FieldType.OBJECT && def.fields != null) {
                ComponentModel nestedModel = buildComponentModel(fieldName, def.fields);
                model.field(fieldName, fieldType, rule, nestedModel);
            } else {
                model.field(fieldName, fieldType, rule, null);
            }

            // Store nested fields if OBJECT or ARRAY
            if (fieldType == FieldType.OBJECT && def.fields != null) {
                ComponentModel nestedModel = buildComponentModel(fieldName, def.fields);
                // optional: associate nestedModel to parent (if needed for deeper inspection)
            }
        }
        return model;
    }

}
