package com.craftify.notebooks;

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

@Document(collection = "notebooks")
public class Notebook {

  @Id @JsonIgnore private ObjectId _id;

  @Transient
  @JsonProperty("id")
  private String id;

  private String title;
  private String content;

  @Indexed private String userId;

  @CreatedDate private Instant createdAt;

  @LastModifiedDate private Instant updatedAt;

  public Notebook() {}

  public Notebook(String title, String content, String userId) {
    this.title = title;
    this.content = content;
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

  public String getTitle() {
    return title;
  }

  public void setTitle(String title) {
    this.title = title;
  }

  public String getContent() {
    return content;
  }

  public void setContent(String content) {
    this.content = content;
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
