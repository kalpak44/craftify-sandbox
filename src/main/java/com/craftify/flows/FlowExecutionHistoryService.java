package com.craftify.flows;

import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class FlowExecutionHistoryService {

  private final FlowExecutionHistoryRepository flowExecutionHistoryRepository;

  public FlowExecutionHistoryService(
      FlowExecutionHistoryRepository flowExecutionHistoryRepository) {
    this.flowExecutionHistoryRepository = flowExecutionHistoryRepository;
  }

  public FlowExecutionHistory saveExecutionHistory(FlowExecutionHistory history) {
    return flowExecutionHistoryRepository.save(history);
  }

  public FlowExecutionHistory createExecutionHistory(
      String flowId, String userId, String flowName, String flowConfiguration) {
    FlowExecutionHistory history =
        new FlowExecutionHistory(flowId, userId, flowName, flowConfiguration);
    return flowExecutionHistoryRepository.save(history);
  }

  public void updateExecutionStatus(String historyId, String status, String errorMessage) {
    FlowExecutionHistory history =
        flowExecutionHistoryRepository
            .findById(historyId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution history not found"));

    history.setExecutionStatus(status);
    if (errorMessage != null) {
      history.setErrorMessage(errorMessage);
    }
    if ("SUCCESS".equals(status) || "FAILED".equals(status)) {
      history.setExecutionCompletedAt(Instant.now());
    }

    flowExecutionHistoryRepository.save(history);
  }

  public void updateExecutionStatus(
      String historyId, String status, String errorMessage, String flowConfiguration) {
    FlowExecutionHistory history =
        flowExecutionHistoryRepository
            .findById(historyId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution history not found"));

    history.setExecutionStatus(status);
    history.setFlowConfiguration(flowConfiguration);
    if (errorMessage != null) {
      history.setErrorMessage(errorMessage);
    }
    if ("SUCCESS".equals(status) || "FAILED".equals(status)) {
      history.setExecutionCompletedAt(Instant.now());
    }

    flowExecutionHistoryRepository.save(history);
  }

  public void updateExecutionStatus(
      String historyId,
      String status,
      String errorMessage,
      String flowConfiguration,
      Long totalExecutionTimeMs,
      Integer nodesExecuted,
      String executionLogs) {
    FlowExecutionHistory history =
        flowExecutionHistoryRepository
            .findById(historyId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution history not found"));

    history.setExecutionStatus(status);
    if (flowConfiguration != null) {
      history.setFlowConfiguration(flowConfiguration);
    }
    if (errorMessage != null) {
      history.setErrorMessage(errorMessage);
    }
    if (totalExecutionTimeMs != null) {
      history.setTotalExecutionTimeMs(totalExecutionTimeMs);
    }
    if (nodesExecuted != null) {
      history.setNodesExecuted(nodesExecuted);
    }
    if (executionLogs != null) {
      history.setExecutionLogs(executionLogs);
    }
    if ("SUCCESS".equals(status) || "FAILED".equals(status)) {
      history.setExecutionCompletedAt(Instant.now());
    }

    flowExecutionHistoryRepository.save(history);
  }

  public Page<FlowExecutionHistory> getExecutionHistoryForUser(String userId, Pageable pageable) {
    return flowExecutionHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
  }

  public Page<FlowExecutionHistory> getExecutionHistoryForFlow(
      String flowId, String userId, Pageable pageable) {
    return flowExecutionHistoryRepository.findByFlowIdAndUserIdOrderByCreatedAtDesc(
        flowId, userId, pageable);
  }

  public List<FlowExecutionHistory> getAllExecutionHistoryForFlow(String flowId, String userId) {
    return flowExecutionHistoryRepository.findByFlowIdAndUserIdOrderByCreatedAtDesc(flowId, userId);
  }

  public FlowExecutionHistory getExecutionHistory(String historyId, String userId) {
    FlowExecutionHistory history =
        flowExecutionHistoryRepository
            .findById(historyId)
            .orElseThrow(() -> new ResourceNotFoundException("Execution history not found"));

    if (!history.getUserId().equals(userId)) {
      throw new UnauthorizedException("Access denied to execution history");
    }

    return history;
  }

  public void deleteExecutionHistory(String historyId, String userId) {
    FlowExecutionHistory history = getExecutionHistory(historyId, userId);
    flowExecutionHistoryRepository.delete(history);
  }

  public void deleteAllExecutionHistoryForFlow(String flowId, String userId) {
    flowExecutionHistoryRepository.deleteByFlowIdAndUserId(flowId, userId);
  }
}
