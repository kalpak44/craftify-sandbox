package com.craftify.files;

import com.craftify.auth.AuthUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;
import java.util.Map;
import org.springframework.beans.factory.annotation.Autowired;
import java.util.HashMap;
import java.util.ArrayList;

@RestController
@RequestMapping("/files")
public class FileNodeController {
    private final FileNodeService fileNodeService;
    private final AuthUtil authUtil;
    @Autowired
    private SchemaFileService schemaFileService;

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
    public List<Map<String, Object>> getFolderSchemaTree() {
        String userId = authUtil.getCurrentUserId();
        List<FileNode> allFolders = new ArrayList<>();
        collectFolders(userId, null, allFolders);
        List<SchemaFile> allSchemas = schemaFileService.listSchemasByUser(userId);
        Map<String, List<SchemaFile>> schemasByFolder = new HashMap<>();
        for (SchemaFile schema : allSchemas) {
            schemasByFolder.computeIfAbsent(schema.getFolderId(), k -> new ArrayList<>()).add(schema);
        }
        List<Map<String, Object>> tree = new ArrayList<>();
        for (FileNode folder : allFolders) {
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

    private Map<String, Object> buildFolderNode(FileNode folder, List<FileNode> allFolders, Map<String, List<SchemaFile>> schemasByFolder) {
        Map<String, Object> node = new HashMap<>();
        node.put("id", folder.getId());
        node.put("name", folder.getName());
        node.put("type", "folder");
        List<Map<String, Object>> children = new ArrayList<>();
        List<SchemaFile> schemas = schemasByFolder.getOrDefault(folder.getId(), new ArrayList<>());
        for (SchemaFile schema : schemas) {
            Map<String, Object> schemaNode = new HashMap<>();
            schemaNode.put("id", schema.getId());
            String name = schema.getName();
            if (name != null && name.contains(".")) {
                name = name.substring(0, name.lastIndexOf('.'));
            }
            schemaNode.put("name", name);
            schemaNode.put("type", "schema");
            children.add(schemaNode);
        }
        for (FileNode subfolder : allFolders) {
            if (folder.getId().equals(subfolder.getParentId())) {
                children.add(buildFolderNode(subfolder, allFolders, schemasByFolder));
            }
        }
        node.put("children", children);
        return node;
    }
} 