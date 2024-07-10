package com.craftify.shared.document;

import org.springframework.data.annotation.Id;

public abstract class IdentifiedDocument<T> {
  @Id private T id;

  public T getId() {
    return id;
  }

  public void setId(T id) {
    this.id = id;
  }
}
