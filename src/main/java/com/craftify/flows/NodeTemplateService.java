package com.craftify.flows;

import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;

@Service
public class NodeTemplateService {

    private final NodeTemplateRepository nodeTemplateRepository;

    @Autowired
    public NodeTemplateService(NodeTemplateRepository nodeTemplateRepository) {
        this.nodeTemplateRepository = nodeTemplateRepository;
    }

    public NodeTemplate createNodeTemplate(NodeTemplate nodeTemplate, String userId) {
        nodeTemplate.setUserId(userId);
        return nodeTemplateRepository.save(nodeTemplate);
    }

    public Page<NodeTemplate> getNodeTemplatesForUser(String userId, Pageable pageable) {
        return nodeTemplateRepository.findByUserId(userId, pageable);
    }

    public List<NodeTemplate> getNodeTemplatesByType(String userId, String nodeType) {
        return nodeTemplateRepository.findByUserIdAndNodeType(userId, nodeType);
    }

    public NodeTemplate getNodeTemplate(String id, String userId) {
        var nodeTemplate = nodeTemplateRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Node template not found with id: " + id));
        
        if (!nodeTemplate.getUserId().equals(userId)) {
            throw new UnauthorizedException("User not authorized to access this node template.");
        }
        
        return nodeTemplate;
    }

    public NodeTemplate updateNodeTemplate(String id, NodeTemplate incoming, String userId) {
        var existingNodeTemplate = getNodeTemplate(id, userId);
        
        existingNodeTemplate.setName(incoming.getName());
        existingNodeTemplate.setDescription(incoming.getDescription());
        existingNodeTemplate.setNodeType(incoming.getNodeType());
        existingNodeTemplate.setConfiguration(incoming.getConfiguration());
        existingNodeTemplate.setUpdatedAt(Instant.now());
        
        return nodeTemplateRepository.save(existingNodeTemplate);
    }

    public void deleteNodeTemplate(String id, String userId) {
        var nodeTemplate = getNodeTemplate(id, userId);
        nodeTemplateRepository.delete(nodeTemplate);
    }
} 