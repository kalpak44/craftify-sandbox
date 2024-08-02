package com.craftify.products.dto;

import com.craftify.shared.dto.SearchFilter;
import jakarta.annotation.Nullable;

import java.util.Set;

public class ProductSearchFilter implements SearchFilter {
  @Nullable
  private String name;
  private Set<String> categories;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }

  public Set<String> getCategories() {
    return categories;
  }

  public void setCategories(Set<String> categories) {
    this.categories = categories;
  }
}
