package com.craftify.files;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import org.bson.types.ObjectId;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "files")
public class FileNode {
    @Id
    @JsonIgnore
    private ObjectId _id;

    @Transient
    @JsonProperty("id")
    private String id;

    private String name;
    private String type; // "file" or "folder"
    private String parentId; // null for root
    @Indexed
    private String userId;
    private boolean isFavorite;

    @CreatedDate
    private Instant createdAt;
    @LastModifiedDate
    private Instant updatedAt;

    public FileNode() {}

    public FileNode(String name, String type, String parentId, String userId) {
        this.name = name;
        this.type = type;
        this.parentId = parentId;
        this.userId = userId;
        this.isFavorite = false;
    }

    public String getId() { return _id != null ? _id.toHexString() : null; }
    public void setId(String id) { this._id = id != null ? new ObjectId(id) : null; }
    public ObjectId getObjectId() { return _id; }
    public void setObjectId(ObjectId _id) { this._id = _id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }
    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }
    public boolean isFavorite() { return isFavorite; }
    public void setFavorite(boolean favorite) { isFavorite = favorite; }
    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
} 