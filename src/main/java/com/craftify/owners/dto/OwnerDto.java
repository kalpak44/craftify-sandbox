package com.craftify.owners.dto;

import com.craftify.shared.dto.IdentifiedDto;

public class OwnerDto extends IdentifiedDto<String> {
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
