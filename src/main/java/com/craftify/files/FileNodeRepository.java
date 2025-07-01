package com.craftify.files;

import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface FileNodeRepository extends MongoRepository<FileNode, String> {
  List<FileNode> findByUserIdAndParentId(String userId, String parentId);

  List<FileNode> findByUserIdAndParentIdIsNull(String userId);

  List<FileNode> findByUserIdAndIsFavoriteTrue(String userId);
}
