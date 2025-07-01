package com.craftify.flows;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import java.time.Instant;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "flows")
public class Flow {

  @Id @JsonIgnore private ObjectId _id;

  @Transient
  @JsonProperty("id")
  private String id;

  private String name;
  private String description;
  private String configuration;
  private boolean active;

  @Indexed private String userId;

  @CreatedDate private Instant createdAt;

  @LastModifiedDate private Instant updatedAt;

  public Flow() {}

  public Flow(
      String name, String description, String configuration, boolean active, String userId) {
    this.name = name;
    this.description = description;
    this.configuration = configuration;
    this.active = active;
    this.userId = userId;
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

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getDescription() {
    return description;
  }

  public void setDescription(String description) {
    this.description = description;
  }

  public String getConfiguration() {
    return configuration;
  }

  public void setConfiguration(String configuration) {
    this.configuration = configuration;
  }

  public boolean isActive() {
    return active;
  }

  public void setActive(boolean active) {
    this.active = active;
  }

  public String getUserId() {
    return userId;
  }

  public void setUserId(String userId) {
    this.userId = userId;
  }

  public Instant getCreatedAt() {
    return createdAt;
  }

  public void setCreatedAt(Instant createdAt) {
    this.createdAt = createdAt;
  }

  public Instant getUpdatedAt() {
    return updatedAt;
  }

  public void setUpdatedAt(Instant updatedAt) {
    this.updatedAt = updatedAt;
  }
}
