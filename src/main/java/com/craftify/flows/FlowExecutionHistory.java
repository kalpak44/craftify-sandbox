package com.craftify.flows;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "flow_execution_history")
public class FlowExecutionHistory {

    @Id
    @JsonIgnore
    private ObjectId _id;

    @Transient
    @JsonProperty("id")
    private String id;

    @Indexed
    private String flowId;

    @Indexed
    private String userId;

    private String flowName;
    private String flowConfiguration;
    private String executionStatus; // SUCCESS, FAILED, IN_PROGRESS
    private String errorMessage;
    private Instant executionStartedAt;
    private Instant executionCompletedAt;

    @CreatedDate
    private Instant createdAt;

    public FlowExecutionHistory() {
    }

    public FlowExecutionHistory(String flowId, String userId, String flowName, String flowConfiguration) {
        this.flowId = flowId;
        this.userId = userId;
        this.flowName = flowName;
        this.flowConfiguration = flowConfiguration;
        this.executionStatus = "IN_PROGRESS";
        this.executionStartedAt = Instant.now();
    }

    // Getters and setters
    public String getId() {
        return _id != null ? _id.toHexString() : null;
    }

    public void setId(String id) {
        this._id = id != null ? new ObjectId(id) : null;
    }

    public ObjectId getObjectId() {
        return _id;
    }

    public void setObjectId(ObjectId _id) {
        this._id = _id;
    }

    public String getFlowId() {
        return flowId;
    }

    public void setFlowId(String flowId) {
        this.flowId = flowId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getFlowName() {
        return flowName;
    }

    public void setFlowName(String flowName) {
        this.flowName = flowName;
    }

    public String getFlowConfiguration() {
        return flowConfiguration;
    }

    public void setFlowConfiguration(String flowConfiguration) {
        this.flowConfiguration = flowConfiguration;
    }

    public String getExecutionStatus() {
        return executionStatus;
    }

    public void setExecutionStatus(String executionStatus) {
        this.executionStatus = executionStatus;
    }

    public String getErrorMessage() {
        return errorMessage;
    }

    public void setErrorMessage(String errorMessage) {
        this.errorMessage = errorMessage;
    }

    public Instant getExecutionStartedAt() {
        return executionStartedAt;
    }

    public void setExecutionStartedAt(Instant executionStartedAt) {
        this.executionStartedAt = executionStartedAt;
    }

    public Instant getExecutionCompletedAt() {
        return executionCompletedAt;
    }

    public void setExecutionCompletedAt(Instant executionCompletedAt) {
        this.executionCompletedAt = executionCompletedAt;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Instant createdAt) {
        this.createdAt = createdAt;
    }
} 