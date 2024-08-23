package com.craftify.notebooks.dto;


import com.craftify.shared.dto.IdentifiedDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import java.util.List;
@JsonIgnoreProperties
public class NotebookDto extends IdentifiedDto<String> {
    private String name;

    private List<NotebookCellDto> cells;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<NotebookCellDto> getCells() {
        return cells;
    }

    public void setCells(List<NotebookCellDto> cells) {
        this.cells = cells;
    }
}
