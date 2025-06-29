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
@RequestMapping("/flows")
public class FlowController {

    private final FlowService flowService;
    private final AuthUtil authUtil;

    public FlowController(FlowService flowService, AuthUtil authUtil) {
        this.flowService = flowService;
        this.authUtil = authUtil;
    }

    @PostMapping
    public ResponseEntity<Flow> createFlow(@RequestBody Flow flow) {
        var userId = authUtil.getCurrentUserId();
        Flow createdFlow = flowService.createFlow(flow, userId);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdFlow);
    }

    @GetMapping
    public Page<Flow> getFlowsForUser(@PageableDefault Pageable pageable) {
        var userId = authUtil.getCurrentUserId();
        return flowService.getFlowsForUser(userId, pageable);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Flow> getFlow(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            var flow = flowService.getFlow(id, userId);
            return ResponseEntity.ok(flow);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Flow> updateFlow(
            @PathVariable String id, @RequestBody Flow incoming) {
        var userId = authUtil.getCurrentUserId();
        try {
            var updatedFlow = flowService.updateFlow(id, incoming, userId);
            return ResponseEntity.ok(updatedFlow);
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(null);
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlow(@PathVariable String id) {
        var userId = authUtil.getCurrentUserId();
        try {
            flowService.deleteFlow(id, userId);
            return ResponseEntity.noContent().build();
        } catch (ResourceNotFoundException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        } catch (UnauthorizedException e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
    }
}