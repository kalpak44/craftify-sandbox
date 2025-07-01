package com.craftify.files;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface SchemaFileRepository extends MongoRepository<SchemaFile, String> {
  List<SchemaFile> findByUserIdAndFolderId(String userId, String folderId);

  List<SchemaFile> findByUserId(String userId);

  List<SchemaFile> findByUserIdAndFolderIdIsNullOrFolderId(String userId, String folderId);
}
