package com.craftify.service;

import com.craftify.model.Flow;
import com.craftify.repository.FlowRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

/** Service layer for managing Flow entities. */
@Service
public class FlowService {

  private final FlowRepository flowRepository;

  /**
   * Constructs a new FlowService with the provided FlowRepository.
   *
   * @param flowRepository the repository for Flow persistence
   */
  public FlowService(FlowRepository flowRepository) {
    this.flowRepository = flowRepository;
  }

  /**
   * Creates and saves a new Flow entity.
   *
   * @param flow the flow to create
   * @return the saved Flow entity
   */
  public Flow create(Flow flow) {
    return flowRepository.save(flow);
  }

  /**
   * Retrieves a paginated list of Flow entities sorted by flow name.
   *
   * @param page the page number to retrieve
   * @param size the number of items per page
   * @return a page of Flow entities
   */
  public Page<Flow> list(int page, int size) {
    Pageable pageable = PageRequest.of(page, size, Sort.by("flowName").ascending());
    return flowRepository.findAll(pageable);
  }

  /**
   * Retrieves a Flow by its ID.
   *
   * @param id the ID of the Flow
   * @return an Optional containing the Flow if found
   */
  public Optional<Flow> getById(String id) {
    return flowRepository.findById(id);
  }

  /**
   * Updates an existing Flow with new values.
   *
   * @param id the ID of the existing Flow
   * @param newFlow the new Flow data
   * @return an Optional containing the updated Flow if the original was found
   */
  public Optional<Flow> update(String id, Flow newFlow) {
    return flowRepository
        .findById(id)
        .map(
            existing -> {
              var updated =
                  new Flow(
                      existing.id(),
                      newFlow.flowName(),
                      newFlow.flowDescription(),
                      newFlow.parameters());
              return flowRepository.save(updated);
            });
  }

  /**
   * Deletes a Flow by its ID.
   *
   * @param id the ID of the Flow to delete
   */
  public void delete(String id) {
    flowRepository.deleteById(id);
  }
}
