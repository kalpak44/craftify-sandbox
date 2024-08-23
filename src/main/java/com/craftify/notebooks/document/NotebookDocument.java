package com.craftify.notebooks.document;


import com.craftify.shared.document.UserDataDocument;
import com.craftify.shared.dto.IdentifiedDto;
import java.util.List;

public class NotebookDocument extends IdentifiedDto<String> implements UserDataDocument {
    private String name;
    private String userId;

    private List<NotebookCellDocument> cells;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<NotebookCellDocument> getCells() {
        return cells;
    }

    public void setCells(List<NotebookCellDocument> cells) {
        this.cells = cells;
    }

    @Override
    public String getUserId() {
        return this.userId;
    }

    @Override
    public void setUserId(String userId) {
        this.userId = userId;
    }
}
