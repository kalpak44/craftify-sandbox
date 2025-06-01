package com.craftify.notebooks;

import com.craftify.auth.AuthUtil;
import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notebooks")
public class NotebookController {

    private final NotebookService notebookService;
    private final AuthUtil authUtil;

    public NotebookController(NotebookService notebookService, AuthUtil authUtil) {
        this.notebookService = notebookService;
        this.authUtil = authUtil;
    }

    @PostMapping
    public ResponseEntity<Notebook> createNotebook(@RequestBody Notebook notebook) {
        var userId = authUtil.getCurrentUserId();
        // The service will handle setting the userId and other creation logic
        Notebook createdNotebook = notebookService.createNotebook(notebook, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNotebook);
    }

    @GetMapping
    public Page<Notebook> getNotebooksForUser(@PageableDefault Pageable pageable) {
        var userId = authUtil.getCurrentUserId();
        return notebookService.getNotebooksForUser(userId, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notebook> getNotebook(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            var notebook = notebookService.getNotebook(id, userId);
            return ResponseEntity.ok(notebook);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notebook> updateNotebook(
            @PathVariable String id, @RequestBody Notebook incoming) {
        var userId = authUtil.getCurrentUserId();
        try {
            var updatedNotebook = notebookService.updateNotebook(id, incoming, userId);
            return ResponseEntity.ok(updatedNotebook);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotebook(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            notebookService.deleteNotebook(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }

    @PostMapping("/{id}/run")
    public ResponseEntity<String> executeNotebookRun(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            var result = notebookService.executeNotebook(id, userId);
            return ResponseEntity.ok(result);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(e.getMessage());
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(e.getMessage());
        } catch (RuntimeException e) {
            // This will catch errors from the K8s execution part or other service-level runtime errors
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error executing notebook: " + e.getMessage());
        }
    }
}
