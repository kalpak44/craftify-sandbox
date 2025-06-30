package com.craftify.files;

import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.List;

public interface FileNodeRepository extends MongoRepository<FileNode, String> {
    List<FileNode> findByUserIdAndParentId(String userId, String parentId);
    List<FileNode> findByUserIdAndParentIdIsNull(String userId);
    List<FileNode> findByUserIdAndIsFavoriteTrue(String userId);
} 