package com.craftify.products.dto;

import com.craftify.shared.dto.SearchFilter;

public class ProductSearchFilter implements SearchFilter {
  private String category;

  public String getCategory() {
    return category;
  }

  public void setCategory(String category) {
    this.category = category;
  }
}
