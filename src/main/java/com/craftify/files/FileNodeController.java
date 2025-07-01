package com.craftify.files;

import com.craftify.auth.AuthUtil;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/files")
public class FileNodeController {
  private final FileNodeService fileNodeService;
  private final AuthUtil authUtil;
  @Autowired private SchemaFileService schemaFileService;

  public FileNodeController(FileNodeService fileNodeService, AuthUtil authUtil) {
    this.fileNodeService = fileNodeService;
    this.authUtil = authUtil;
  }

  @GetMapping
  public List<FileNode> list(@RequestParam(required = false) String parentId) {
    String userId = authUtil.getCurrentUserId();
    return fileNodeService.listByParent(userId, parentId);
  }

  @PostMapping
  public ResponseEntity<FileNode> createFolder(@RequestBody FileNode req) {
    String userId = authUtil.getCurrentUserId();
    FileNode folder = fileNodeService.createFolder(userId, req.getName(), req.getParentId());
    return ResponseEntity.status(HttpStatus.CREATED).body(folder);
  }

  @PatchMapping("/{id}/favorite")
  public FileNode toggleFavorite(@PathVariable String id) {
    String userId = authUtil.getCurrentUserId();
    return fileNodeService.toggleFavorite(userId, id);
  }

  @GetMapping("/favorites")
  public List<FileNode> listFavorites() {
    String userId = authUtil.getCurrentUserId();
    return fileNodeService.listFavorites(userId);
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteFolder(@PathVariable String id) {
    String userId = authUtil.getCurrentUserId();
    fileNodeService.deleteFolder(userId, id);
    return ResponseEntity.noContent().build();
  }

  @PatchMapping("/{id}/rename")
  public FileNode renameFolder(@PathVariable String id, @RequestBody Map<String, String> body) {
    String userId = authUtil.getCurrentUserId();
    String newName = body.get("name");
    return fileNodeService.renameFolder(userId, id, newName);
  }

  @PatchMapping("/{id}/move")
  public FileNode moveFolder(@PathVariable String id, @RequestBody Map<String, String> body) {
    String userId = authUtil.getCurrentUserId();
    String newParentId = body.get("parentId");
    return fileNodeService.moveFolder(userId, id, newParentId);
  }

  @GetMapping("/tree")
  public List<TreeNodeDTO> getFolderSchemaTree() {
    final String userId = authUtil.getCurrentUserId();
    final List<FileNode> allFolders = new ArrayList<>();
    collectFolders(userId, null, allFolders);
    final List<SchemaFile> allSchemas = schemaFileService.listSchemasByUser(userId);
    final Map<String, List<SchemaFile>> schemasByFolder = new HashMap<>();
    for (final SchemaFile schema : allSchemas) {
      schemasByFolder.computeIfAbsent(schema.getFolderId(), k -> new ArrayList<>()).add(schema);
    }
    final List<TreeNodeDTO> tree = new ArrayList<>();
    final List<SchemaFile> rootSchemas = new ArrayList<>();
    for (final SchemaFile schema : allSchemas) {
      if (schema.getFolderId() == null || "root".equals(schema.getFolderId())) {
        rootSchemas.add(schema);
      }
    }
    for (final SchemaFile schema : rootSchemas) {
      tree.add(createSchemaNode(schema));
    }
    for (final FileNode folder : allFolders) {
      if (folder.getParentId() == null) {
        tree.add(buildFolderNode(folder, allFolders, schemasByFolder));
      }
    }
    return tree;
  }

  private void collectFolders(String userId, String parentId, List<FileNode> result) {
    List<FileNode> children = fileNodeService.listByParent(userId, parentId);
    for (FileNode child : children) {
      if ("folder".equals(child.getType())) {
        result.add(child);
        collectFolders(userId, child.getId(), result);
      }
    }
  }

  private TreeNodeDTO buildFolderNode(
      final FileNode folder,
      final List<FileNode> allFolders,
      final Map<String, List<SchemaFile>> schemasByFolder) {
    final TreeNodeDTO node = new TreeNodeDTO();
    node.setId(folder.getId());
    node.setName(folder.getName());
    node.setType("folder");
    final List<TreeNodeDTO> children = new ArrayList<>();
    final List<SchemaFile> schemas =
        schemasByFolder.getOrDefault(folder.getId(), new ArrayList<>());
    for (final SchemaFile schema : schemas) {
      children.add(createSchemaNode(schema));
    }
    for (final FileNode subfolder : allFolders) {
      if (folder.getId().equals(subfolder.getParentId())) {
        children.add(buildFolderNode(subfolder, allFolders, schemasByFolder));
      }
    }
    node.setChildren(children);
    return node;
  }

  private TreeNodeDTO createSchemaNode(final SchemaFile schema) {
    final TreeNodeDTO schemaNode = new TreeNodeDTO();
    schemaNode.setId(schema.getId());
    String name = schema.getName();
    if (name != null && name.contains(".")) {
      name = name.substring(0, name.lastIndexOf('.'));
    }
    schemaNode.setName(name);
    schemaNode.setType("schema");
    schemaNode.setFolderId(schema.getFolderId());
    return schemaNode;
  }
}
