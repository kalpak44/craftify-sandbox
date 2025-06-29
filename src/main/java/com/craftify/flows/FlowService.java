package com.craftify.flows;

import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class FlowService {

    private final FlowRepository flowRepository;

    @Autowired
    public FlowService(FlowRepository flowRepository) {
        this.flowRepository = flowRepository;
    }

    public Flow createFlow(Flow flow, String userId) {
        flow.setUserId(userId);
        return flowRepository.save(flow);
    }

    public Page<Flow> getFlowsForUser(String userId, Pageable pageable) {
        return flowRepository.findByUserId(userId, pageable);
    }

    public Flow getFlow(String id, String userId) {
        var flow = flowRepository
                .findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Flow not found with id: " + id));
        
        if (!flow.getUserId().equals(userId)) {
            throw new UnauthorizedException("User not authorized to access this flow.");
        }
        
        return flow;
    }

    public Flow updateFlow(String id, Flow incoming, String userId) {
        var existingFlow = getFlow(id, userId);
        
        existingFlow.setName(incoming.getName());
        existingFlow.setDescription(incoming.getDescription());
        existingFlow.setConfiguration(incoming.getConfiguration());
        existingFlow.setActive(incoming.isActive());
        existingFlow.setUpdatedAt(Instant.now());
        
        return flowRepository.save(existingFlow);
    }

    public void deleteFlow(String id, String userId) {
        var flow = getFlow(id, userId);
        flowRepository.delete(flow);
    }
}