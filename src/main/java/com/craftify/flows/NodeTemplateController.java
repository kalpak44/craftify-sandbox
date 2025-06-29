package com.craftify.flows;

import com.craftify.auth.AuthUtil;
import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/node-templates")
public class NodeTemplateController {

    private final NodeTemplateService nodeTemplateService;
    private final AuthUtil authUtil;

    public NodeTemplateController(NodeTemplateService nodeTemplateService, AuthUtil authUtil) {
        this.nodeTemplateService = nodeTemplateService;
        this.authUtil = authUtil;
    }

    @PostMapping
    public ResponseEntity<NodeTemplate> createNodeTemplate(@RequestBody NodeTemplate nodeTemplate) {
        var userId = authUtil.getCurrentUserId();
        NodeTemplate createdNodeTemplate = nodeTemplateService.createNodeTemplate(nodeTemplate, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdNodeTemplate);
    }

    @GetMapping
    public Page<NodeTemplate> getNodeTemplatesForUser(@PageableDefault Pageable pageable) {
        var userId = authUtil.getCurrentUserId();
        return nodeTemplateService.getNodeTemplatesForUser(userId, pageable);
    }

    @GetMapping("/by-type/{nodeType}")
    public List<NodeTemplate> getNodeTemplatesByType(@PathVariable String nodeType) {
        var userId = authUtil.getCurrentUserId();
        return nodeTemplateService.getNodeTemplatesByType(userId, nodeType);
    }

    @GetMapping("/{id}")
    public ResponseEntity<NodeTemplate> getNodeTemplate(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            var nodeTemplate = nodeTemplateService.getNodeTemplate(id, userId);
            return ResponseEntity.ok(nodeTemplate);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<NodeTemplate> updateNodeTemplate(
            @PathVariable String id, @RequestBody NodeTemplate incoming) {
        var userId = authUtil.getCurrentUserId();
        try {
            var updatedNodeTemplate = nodeTemplateService.updateNodeTemplate(id, incoming, userId);
            return ResponseEntity.ok(updatedNodeTemplate);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteNodeTemplate(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            nodeTemplateService.deleteNodeTemplate(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
} 