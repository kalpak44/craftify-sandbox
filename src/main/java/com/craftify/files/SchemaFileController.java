package com.craftify.files;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.security.Principal;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/schemas")
public class SchemaFileController {
    @Autowired
    private SchemaFileService schemaFileService;

    // Create or update schema
    @PostMapping
    public SchemaFile saveSchema(@RequestBody SchemaFile schema, Principal principal) {
        // In production, get userId from principal
        String userId = principal != null ? principal.getName() : schema.getUserId();
        schema.setUserId(userId);
        return schemaFileService.createOrUpdateSchema(schema);
    }

    // Get schema by id
    @GetMapping("/{id}")
    public Optional<SchemaFile> getSchema(@PathVariable String id, Principal principal) {
        // Optionally check userId matches
        return schemaFileService.getSchemaById(id);
    }

    // List schemas by folder
    @GetMapping
    public List<SchemaFile> listSchemas(@RequestParam String folderId, Principal principal) {
        String userId = principal != null ? principal.getName() : null;
        return schemaFileService.listSchemasByFolder(userId, folderId);
    }

    // Delete schema
    @DeleteMapping("/{id}")
    public void deleteSchema(@PathVariable String id, Principal principal) {
        schemaFileService.deleteSchema(id);
    }
} 