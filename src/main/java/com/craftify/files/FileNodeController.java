package com.craftify.files;

import com.craftify.auth.AuthUtil;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import org.springframework.http.HttpStatus;
import java.util.List;

@RestController
@RequestMapping("/files")
public class FileNodeController {
    private final FileNodeService fileNodeService;
    private final AuthUtil authUtil;

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
    public FileNode renameFolder(@PathVariable String id, @RequestBody String newName) {
        String userId = authUtil.getCurrentUserId();
        return fileNodeService.renameFolder(userId, id, newName);
    }

    @PatchMapping("/{id}/move")
    public FileNode moveFolder(@PathVariable String id, @RequestBody String newParentId) {
        String userId = authUtil.getCurrentUserId();
        return fileNodeService.moveFolder(userId, id, newParentId);
    }
} 