package com.craftify.shared.dto;

public abstract class IdentifiedDto<T> {
  private T id;

  public T getId() {
    return id;
  }

  public void setId(T id) {
    this.id = id;
  }
}
