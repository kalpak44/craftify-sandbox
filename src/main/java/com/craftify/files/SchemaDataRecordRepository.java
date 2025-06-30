package com.craftify.files;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface SchemaDataRecordRepository extends MongoRepository<SchemaDataRecord, String> {
    
    // Find all records for a specific schema and user
    List<SchemaDataRecord> findBySchemaIdAndUserId(String schemaId, String userId);
    
    // Find all records for a user (across all schemas)
    List<SchemaDataRecord> findByUserId(String userId);
    
    // Delete all records for a specific schema and user
    void deleteBySchemaIdAndUserId(String schemaId, String userId);
    
    // Delete all records for a schema (used when schema is deleted)
    void deleteBySchemaId(String schemaId);
    
    // Count records for a schema and user
    long countBySchemaIdAndUserId(String schemaId, String userId);
} 