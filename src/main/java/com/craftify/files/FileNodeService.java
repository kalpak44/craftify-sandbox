package com.craftify.files;

import com.craftify.common.exception.ResourceNotFoundException;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class FileNodeService {
  private final FileNodeRepository fileNodeRepository;

  @Autowired
  public FileNodeService(FileNodeRepository fileNodeRepository) {
    this.fileNodeRepository = fileNodeRepository;
  }

  public List<FileNode> listByParent(String userId, String parentId) {
    if (parentId == null || parentId.isEmpty()) {
      return fileNodeRepository.findByUserIdAndParentIdIsNull(userId);
    }
    return fileNodeRepository.findByUserIdAndParentId(userId, parentId);
  }

  public FileNode createFolder(String userId, String name, String parentId) {
    FileNode folder = new FileNode(name, "folder", parentId, userId);
    return fileNodeRepository.save(folder);
  }

  public FileNode toggleFavorite(String userId, String id) {
    FileNode node =
        fileNodeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("FileNode not found"));
    if (!node.getUserId().equals(userId)) throw new ResourceNotFoundException("Unauthorized");
    node.setFavorite(!node.isFavorite());
    return fileNodeRepository.save(node);
  }

  public List<FileNode> listFavorites(String userId) {
    return fileNodeRepository.findByUserIdAndIsFavoriteTrue(userId);
  }

  public void deleteFolder(String userId, String id) {
    FileNode folder =
        fileNodeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    if (!folder.getUserId().equals(userId)) throw new ResourceNotFoundException("Unauthorized");
    // Recursively delete children
    deleteChildren(userId, id);
    fileNodeRepository.delete(folder);
  }

  private void deleteChildren(String userId, String parentId) {
    List<FileNode> children = fileNodeRepository.findByUserIdAndParentId(userId, parentId);
    for (FileNode child : children) {
      deleteChildren(userId, child.getId());
      fileNodeRepository.delete(child);
    }
  }

  public FileNode renameFolder(String userId, String id, String newName) {
    FileNode folder =
        fileNodeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    if (!folder.getUserId().equals(userId)) throw new ResourceNotFoundException("Unauthorized");
    folder.setName(newName);
    return fileNodeRepository.save(folder);
  }

  public FileNode moveFolder(String userId, String id, String newParentId) {
    FileNode folder =
        fileNodeRepository
            .findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Folder not found"));
    if (!folder.getUserId().equals(userId)) throw new ResourceNotFoundException("Unauthorized");
    folder.setParentId(newParentId);
    return fileNodeRepository.save(folder);
  }

  public FileNode getFolderById(String userId, String id) {
    if (id == null) return null;
    return fileNodeRepository.findById(id).filter(f -> f.getUserId().equals(userId)).orElse(null);
  }
}
