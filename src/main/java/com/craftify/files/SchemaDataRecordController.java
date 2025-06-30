package com.craftify.files;

import com.craftify.auth.AuthUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/schema-data")
public class SchemaDataRecordController {

    @Autowired
    private SchemaDataRecordService schemaDataRecordService;

    @Autowired
    private SchemaFileService schemaFileService;

    @Autowired
    private AuthUtil authUtil;

    /**
     * Create a new data record for a schema
     */
    @PostMapping("/{schemaId}")
    public ResponseEntity<SchemaDataRecord> createRecord(
            @PathVariable String schemaId,
            @RequestBody Map<String, Object> data) {
        String userId = authUtil.getCurrentUserId();

        System.out.println("Received createRecord request:");
        System.out.println("  schemaId: " + schemaId);
        System.out.println("  userId: " + userId);
        System.out.println("  data: " + data);

        // Validate that the schema exists and belongs to the user
        SchemaFile schema = schemaFileService.getSchemaFile(userId, schemaId);
        if (schema == null) {
            System.out.println("  Schema not found or access denied");
            return ResponseEntity.badRequest().build();
        }

        System.out.println("  Schema found: " + schema.getName());
        SchemaDataRecord record = schemaDataRecordService.createRecord(userId, schemaId, data);
        System.out.println("  Created record with ID: " + record.getId());
        return ResponseEntity.ok(record);
    }

    /**
     * Get all records for a specific schema (table view - system properties only)
     */
    @GetMapping("/{schemaId}/table")
    public ResponseEntity<List<Map<String, Object>>> getRecordsForTable(@PathVariable String schemaId) {
        String userId = authUtil.getCurrentUserId();

        // Validate that the schema exists and belongs to the user
        SchemaFile schema = schemaFileService.getSchemaFile(userId, schemaId);
        if (schema == null) {
            return ResponseEntity.badRequest().build();
        }

        List<SchemaDataRecord> records = schemaDataRecordService.getRecordsBySchema(userId, schemaId);

        // Convert to table format with system properties and name/description
        List<Map<String, Object>> tableData = records.stream()
                .map(record -> {
                    Map<String, Object> row = new java.util.HashMap<>();
                    row.put("id", record.getId());
                    row.put("createdAt", record.getCreatedAt());
                    row.put("updatedAt", record.getUpdatedAt());

                    // Add name and description from the data if they exist
                    Map<String, Object> data = record.getData();
                    if (data != null) {
                        row.put("name", data.get("name"));
                        row.put("description", data.get("description"));
                    }

                    return row;
                })
                .collect(java.util.stream.Collectors.toList());

        return ResponseEntity.ok(tableData);
    }

    /**
     * Get all records for a specific schema
     */
    @GetMapping("/{schemaId}")
    public ResponseEntity<List<SchemaDataRecord>> getRecordsBySchema(@PathVariable String schemaId) {
        String userId = authUtil.getCurrentUserId();

        // Validate that the schema exists and belongs to the user
        SchemaFile schema = schemaFileService.getSchemaFile(userId, schemaId);
        if (schema == null) {
            return ResponseEntity.badRequest().build();
        }

        List<SchemaDataRecord> records = schemaDataRecordService.getRecordsBySchema(userId, schemaId);
        return ResponseEntity.ok(records);
    }

    /**
     * Get a specific record by ID
     */
    @GetMapping("/record/{recordId}")
    public ResponseEntity<SchemaDataRecord> getRecord(@PathVariable String recordId) {
        String userId = authUtil.getCurrentUserId();
        return schemaDataRecordService.getRecord(userId, recordId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    /**
     * Update an existing record
     */
    @PutMapping("/record/{recordId}")
    public ResponseEntity<SchemaDataRecord> updateRecord(
            @PathVariable String recordId,
            @RequestBody Map<String, Object> data) {
        String userId = authUtil.getCurrentUserId();
        try {
            SchemaDataRecord record = schemaDataRecordService.updateRecord(userId, recordId, data);
            return ResponseEntity.ok(record);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Delete a specific record
     */
    @DeleteMapping("/record/{recordId}")
    public ResponseEntity<Void> deleteRecord(@PathVariable String recordId) {
        String userId = authUtil.getCurrentUserId();
        schemaDataRecordService.deleteRecord(userId, recordId);
        return ResponseEntity.ok().build();
    }

    /**
     * Get count of records for a schema
     */
    @GetMapping("/{schemaId}/count")
    public ResponseEntity<Map<String, Long>> getRecordCount(@PathVariable String schemaId) {
        String userId = authUtil.getCurrentUserId();

        // Validate that the schema exists and belongs to the user
        SchemaFile schema = schemaFileService.getSchemaFile(userId, schemaId);
        if (schema == null) {
            return ResponseEntity.badRequest().build();
        }

        long count = schemaDataRecordService.getRecordCount(userId, schemaId);
        return ResponseEntity.ok(Map.of("count", count));
    }

    /**
     * Get all records for the current user (across all schemas)
     */
    @GetMapping("/user/all")
    public ResponseEntity<List<SchemaDataRecord>> getAllUserRecords() {
        String userId = authUtil.getCurrentUserId();
        List<SchemaDataRecord> records = schemaDataRecordService.getAllUserRecords(userId);
        return ResponseEntity.ok(records);
    }
} 