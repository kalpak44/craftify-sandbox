package com.craftify.products.dto;

import com.craftify.shared.dto.IdentifiedDto;

public class ProductDto extends IdentifiedDto<String> {
  private String name;
  private String ownerId;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public String getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(String ownerId) {
    this.ownerId = ownerId;
  }
}
