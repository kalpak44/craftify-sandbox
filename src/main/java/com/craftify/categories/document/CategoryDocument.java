package com.craftify.categories.document;

import com.craftify.shared.dto.IdentifiedDto;

public class CategoryDocument extends IdentifiedDto<String> {
    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }
}
