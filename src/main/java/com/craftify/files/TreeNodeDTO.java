package com.craftify.files;

import java.util.ArrayList;
import java.util.List;

public class TreeNodeDTO {
    private String id;
    private String name;
    private String type;
    private String folderId;
    private List<TreeNodeDTO> children = new ArrayList<>();

    public TreeNodeDTO() {}

    public TreeNodeDTO(String id, String name, String type, String folderId) {
        this.id = id;
        this.name = name;
        this.type = type;
        this.folderId = folderId;
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getType() { return type; }
    public void setType(String type) { this.type = type; }
    public String getFolderId() { return folderId; }
    public void setFolderId(String folderId) { this.folderId = folderId; }
    public List<TreeNodeDTO> getChildren() { return children; }
    public void setChildren(List<TreeNodeDTO> children) { this.children = children; }
} 