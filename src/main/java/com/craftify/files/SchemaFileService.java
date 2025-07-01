package com.craftify.files;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class SchemaFileService {
  @Autowired private SchemaFileRepository schemaFileRepository;

  @Autowired private SchemaDataRecordService schemaDataRecordService;

  public SchemaFile createOrUpdateSchema(SchemaFile schema) {
    Instant now = Instant.now();
    if (schema.getId() == null) {
      schema.setCreatedAt(now);
    }
    schema.setUpdatedAt(now);
    return schemaFileRepository.save(schema);
  }

  public Optional<SchemaFile> getSchemaById(String id) {
    return schemaFileRepository.findById(id);
  }

  public SchemaFile getSchemaFile(String userId, String schemaId) {
    Optional<SchemaFile> schema = schemaFileRepository.findById(schemaId);
    if (schema.isPresent() && schema.get().getUserId().equals(userId)) {
      return schema.get();
    }
    return null;
  }

  public List<SchemaFile> listSchemasByFolder(String userId, String folderId) {
    if (folderId == null || folderId.equals("root")) {
      // Return schemas where folderId is null or 'root'
      return schemaFileRepository.findByUserIdAndFolderIdIsNullOrFolderId(userId, "root");
    }
    return schemaFileRepository.findByUserIdAndFolderId(userId, folderId);
  }

  public void deleteSchema(String id) {
    // First delete all data records for this schema
    schemaDataRecordService.deleteRecordsBySchema(id);
    // Then delete the schema itself
    schemaFileRepository.deleteById(id);
  }

  public List<SchemaFile> listSchemasByUser(String userId) {
    return schemaFileRepository.findByUserId(userId);
  }
}
