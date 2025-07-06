package com.craftify.service;

import com.craftify.model.Flow;
import com.craftify.repository.FlowRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class FlowService {

    private final FlowRepository flowRepository;

    public FlowService(FlowRepository flowRepository) {
        this.flowRepository = flowRepository;
    }

    public Flow create(Flow flow) {
        return flowRepository.save(flow);
    }

    public Page<Flow> list(int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("flowName").ascending());
        return flowRepository.findAll(pageable);
    }

    public Optional<Flow> getById(String id) {
        return flowRepository.findById(id);
    }

    public Optional<Flow> update(String id, Flow newFlow) {
        return flowRepository.findById(id).map(existing -> {
            Flow updated = new Flow(
                    existing.id(),  // keep same ID
                    newFlow.flowName(),
                    newFlow.flowDescription(),
                    newFlow.parameters()
            );
            return flowRepository.save(updated);
        });
    }

    public void delete(String id) {
        flowRepository.deleteById(id);
    }
}
