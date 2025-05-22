package com.craftify.notebooks;

import com.craftify.security.AuthUtil;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.Optional;

@RestController
@RequestMapping("/api/notebooks")
public class NotebookController {

    private final NotebookRepository repository;
    private final AuthUtil authUtil;

    public NotebookController(NotebookRepository repository, AuthUtil authUtil) {
        this.repository = repository;
        this.authUtil = authUtil;
    }

    @PostMapping
    public Notebook createNotebook(@RequestBody Notebook notebook) {
        String userId = authUtil.getCurrentUserId();
        notebook.setId(null);
        notebook.setUserId(userId);
        return repository.save(notebook);
    }

    @GetMapping
    public Page<Notebook> getNotebooksForUser(@PageableDefault Pageable pageable) {
        String userId = authUtil.getCurrentUserId();
        return repository.findByUserId(userId, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Notebook> getNotebook(@PathVariable String id) {
        Optional<Notebook> notebookOpt = repository.findById(id);
        String userId = authUtil.getCurrentUserId();

        if (notebookOpt.isPresent() && userId.equals(notebookOpt.get().getUserId())) {
            return ResponseEntity.ok(notebookOpt.get());
        }
        return ResponseEntity.notFound().build();
    }

    @PutMapping("/{id}")
    public ResponseEntity<Notebook> updateNotebook(@PathVariable String id, @RequestBody Notebook incoming) {
        Optional<Notebook> existingOpt = repository.findById(id);
        String userId = authUtil.getCurrentUserId();

        if (existingOpt.isPresent() && userId.equals(existingOpt.get().getUserId())) {
            Notebook existing = existingOpt.get();
            existing.setTitle(incoming.getTitle());
            existing.setContent(incoming.getContent());
            existing.setUpdatedAt(Instant.now());
            return ResponseEntity.ok(repository.save(existing));
        }

        return ResponseEntity.notFound().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNotebook(@PathVariable String id) {
        Optional<Notebook> existingOpt = repository.findById(id);
        String userId = authUtil.getCurrentUserId();

        if (existingOpt.isPresent() && userId.equals(existingOpt.get().getUserId())) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }

        return ResponseEntity.notFound().build();
    }
}
