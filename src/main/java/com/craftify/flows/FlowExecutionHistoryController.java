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

@RestController
@RequestMapping("/flow-execution-history")
public class FlowExecutionHistoryController {

  private final FlowExecutionHistoryService flowExecutionHistoryService;
  private final AuthUtil authUtil;

  public FlowExecutionHistoryController(
      FlowExecutionHistoryService flowExecutionHistoryService, AuthUtil authUtil) {
    this.flowExecutionHistoryService = flowExecutionHistoryService;
    this.authUtil = authUtil;
  }

  @GetMapping
  public ResponseEntity<Page<FlowExecutionHistory>> getExecutionHistoryForUser(
      @PageableDefault Pageable pageable) {
    var userId = authUtil.getCurrentUserId();
    Page<FlowExecutionHistory> history =
        flowExecutionHistoryService.getExecutionHistoryForUser(userId, pageable);
    return ResponseEntity.ok(history);
  }

  @GetMapping("/flow/{flowId}")
  public ResponseEntity<Page<FlowExecutionHistory>> getExecutionHistoryForFlow(
      @PathVariable String flowId, @PageableDefault Pageable pageable) {
    var userId = authUtil.getCurrentUserId();
    try {
      Page<FlowExecutionHistory> history =
          flowExecutionHistoryService.getExecutionHistoryForFlow(flowId, userId, pageable);
      return ResponseEntity.ok(history);
    } catch (ResourceNotFoundException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    } catch (UnauthorizedException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @GetMapping("/{id}")
  public ResponseEntity<FlowExecutionHistory> getExecutionHistory(@PathVariable String id) {
    var userId = authUtil.getCurrentUserId();
    try {
      FlowExecutionHistory history = flowExecutionHistoryService.getExecutionHistory(id, userId);
      return ResponseEntity.ok(history);
    } catch (ResourceNotFoundException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    } catch (UnauthorizedException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> deleteExecutionHistory(@PathVariable String id) {
    var userId = authUtil.getCurrentUserId();
    try {
      flowExecutionHistoryService.deleteExecutionHistory(id, userId);
      return ResponseEntity.noContent().build();
    } catch (ResourceNotFoundException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    } catch (UnauthorizedException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }

  @DeleteMapping("/flow/{flowId}")
  public ResponseEntity<Void> deleteAllExecutionHistoryForFlow(@PathVariable String flowId) {
    var userId = authUtil.getCurrentUserId();
    try {
      flowExecutionHistoryService.deleteAllExecutionHistoryForFlow(flowId, userId);
      return ResponseEntity.noContent().build();
    } catch (ResourceNotFoundException e) {
      return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
    } catch (UnauthorizedException e) {
      return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
    }
  }
}
