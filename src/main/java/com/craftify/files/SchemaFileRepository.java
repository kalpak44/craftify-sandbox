package com.craftify.files;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface SchemaFileRepository extends MongoRepository<SchemaFile, String> {
    List<SchemaFile> findByUserIdAndFolderId(String userId, String folderId);
    List<SchemaFile> findByUserId(String userId);
} 