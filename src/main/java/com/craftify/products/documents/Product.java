package com.craftify.products.documents;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Product {
  @Id private UUID id;
  private UUID ownerId;
  private String name;

  public Product() {
    this.id = UUID.randomUUID();
  }

  public Product(String name, UUID ownerId) {
    this.id = UUID.randomUUID();
    this.name = name;
    this.ownerId = ownerId;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public UUID getOwnerId() {
    return ownerId;
  }

  public void setOwnerId(UUID ownerId) {
    this.ownerId = ownerId;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
