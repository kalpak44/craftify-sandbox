package com.craftify.files;

import com.craftify.common.exception.ResourceNotFoundException;
import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SchemaDataRecordService {

  @Autowired private SchemaDataRecordRepository schemaDataRecordRepository;

  /** Create a new data record for a schema */
  public SchemaDataRecord createRecord(
      String userId, String schemaId, java.util.Map<String, Object> data) {
    // Note: Schema validation should be done at the controller level
    // to avoid circular dependency
    SchemaDataRecord record = new SchemaDataRecord(schemaId, userId, data);
    return schemaDataRecordRepository.save(record);
  }

  /** Get all records for a specific schema and user */
  public List<SchemaDataRecord> getRecordsBySchema(String userId, String schemaId) {
    return schemaDataRecordRepository.findBySchemaIdAndUserId(schemaId, userId);
  }

  /** Get a specific record by ID */
  public Optional<SchemaDataRecord> getRecord(String userId, String recordId) {
    Optional<SchemaDataRecord> record = schemaDataRecordRepository.findById(recordId);
    if (record.isPresent() && !record.get().getUserId().equals(userId)) {
      return Optional.empty(); // User doesn't own this record
    }
    return record;
  }

  /** Delete a specific record */
  public void deleteRecord(String userId, String recordId) {
    Optional<SchemaDataRecord> record = getRecord(userId, recordId);
    if (record.isPresent()) {
      schemaDataRecordRepository.deleteById(recordId);
    }
  }

  /** Delete all records for a schema (called when schema is deleted) */
  public void deleteRecordsBySchema(String schemaId) {
    schemaDataRecordRepository.deleteBySchemaId(schemaId);
  }

  /** Get count of records for a schema */
  public long getRecordCount(String userId, String schemaId) {
    return schemaDataRecordRepository.countBySchemaIdAndUserId(schemaId, userId);
  }

  /** Get all records for a user (across all schemas) */
  public List<SchemaDataRecord> getAllUserRecords(String userId) {
    return schemaDataRecordRepository.findByUserId(userId);
  }

  public SchemaDataRecord findByIdAndUserId(String id, String userId) {
    SchemaDataRecord record =
        schemaDataRecordRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Schema data record not found"));

    if (!record.getUserId().equals(userId)) {
      throw new ResourceNotFoundException("Schema data record not found");
    }

    return record;
  }

  public SchemaDataRecord updateRecord(String id, String userId, Map<String, Object> data) {
    SchemaDataRecord existingRecord = findByIdAndUserId(id, userId);

    existingRecord.setData(data);
    existingRecord.setUpdatedAt(Instant.now());

    return schemaDataRecordRepository.save(existingRecord);
  }
}
