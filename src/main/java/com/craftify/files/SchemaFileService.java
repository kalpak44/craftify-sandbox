package com.craftify.files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import java.util.Optional;

@Service
public class SchemaFileService {
    @Autowired
    private SchemaFileRepository schemaFileRepository;

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

    public List<SchemaFile> listSchemasByFolder(String userId, String folderId) {
        return schemaFileRepository.findByUserIdAndFolderId(userId, folderId);
    }

    public void deleteSchema(String id) {
        schemaFileRepository.deleteById(id);
    }

    public List<SchemaFile> listSchemasByUser(String userId) {
        return schemaFileRepository.findByUserId(userId);
    }
} 