package com.craftify.flows;

import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface FlowExecutionHistoryRepository
    extends MongoRepository<FlowExecutionHistory, String> {

  Page<FlowExecutionHistory> findByUserIdOrderByCreatedAtDesc(String userId, Pageable pageable);

  Page<FlowExecutionHistory> findByFlowIdAndUserIdOrderByCreatedAtDesc(
      String flowId, String userId, Pageable pageable);

  List<FlowExecutionHistory> findByFlowIdAndUserIdOrderByCreatedAtDesc(
      String flowId, String userId);

  void deleteByFlowIdAndUserId(String flowId, String userId);
}
