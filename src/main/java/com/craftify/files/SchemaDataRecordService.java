package com.craftify.files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Optional;

@Service
public class SchemaDataRecordService {
    
    @Autowired
    private SchemaDataRecordRepository schemaDataRecordRepository;
    
    /**
     * Create a new data record for a schema
     */
    public SchemaDataRecord createRecord(String userId, String schemaId, java.util.Map<String, Object> data) {
        // Note: Schema validation should be done at the controller level
        // to avoid circular dependency
        SchemaDataRecord record = new SchemaDataRecord(schemaId, userId, data);
        return schemaDataRecordRepository.save(record);
    }
    
    /**
     * Get all records for a specific schema and user
     */
    public List<SchemaDataRecord> getRecordsBySchema(String userId, String schemaId) {
        return schemaDataRecordRepository.findBySchemaIdAndUserId(schemaId, userId);
    }
    
    /**
     * Get a specific record by ID
     */
    public Optional<SchemaDataRecord> getRecord(String userId, String recordId) {
        Optional<SchemaDataRecord> record = schemaDataRecordRepository.findById(recordId);
        if (record.isPresent() && !record.get().getUserId().equals(userId)) {
            return Optional.empty(); // User doesn't own this record
        }
        return record;
    }
    
    /**
     * Update an existing record
     */
    public SchemaDataRecord updateRecord(String userId, String recordId, java.util.Map<String, Object> data) {
        Optional<SchemaDataRecord> existingRecord = getRecord(userId, recordId);
        if (existingRecord.isEmpty()) {
            throw new RuntimeException("Record not found or access denied");
        }
        
        SchemaDataRecord record = existingRecord.get();
        record.setData(data);
        return schemaDataRecordRepository.save(record);
    }
    
    /**
     * Delete a specific record
     */
    public void deleteRecord(String userId, String recordId) {
        Optional<SchemaDataRecord> record = getRecord(userId, recordId);
        if (record.isPresent()) {
            schemaDataRecordRepository.deleteById(recordId);
        }
    }
    
    /**
     * Delete all records for a schema (called when schema is deleted)
     */
    public void deleteRecordsBySchema(String schemaId) {
        schemaDataRecordRepository.deleteBySchemaId(schemaId);
    }
    
    /**
     * Get count of records for a schema
     */
    public long getRecordCount(String userId, String schemaId) {
        return schemaDataRecordRepository.countBySchemaIdAndUserId(schemaId, userId);
    }
    
    /**
     * Get all records for a user (across all schemas)
     */
    public List<SchemaDataRecord> getAllUserRecords(String userId) {
        return schemaDataRecordRepository.findByUserId(userId);
    }
} 