package com.craftify.categories.dto;

import com.craftify.shared.dto.IdentifiedDto;

public class CategoryDto extends IdentifiedDto<String> {
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
