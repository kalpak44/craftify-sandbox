package com.craftify.files;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import java.time.Instant;

@Document(collection = "schema_files")
public class SchemaFile {
    @Id
    private String id;
    private String name;
    private String content;
    private String folderId; // null or "root" for root
    private String userId;
    private Instant createdAt;
    private Instant updatedAt;

    public SchemaFile() {}

    public SchemaFile(String name, String content, String folderId, String userId) {
        this.name = name;
        this.content = content;
        this.folderId = folderId;
        this.userId = userId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getFolderId() { return folderId; }
    public void setFolderId(String folderId) { this.folderId = folderId; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
} 