package com.craftify.documents;

import java.util.UUID;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Owner {
  @Id private UUID id;
  private String name;

  // Constructors, getters and setters
  public Owner() {
    this.id = UUID.randomUUID();
  }

  public Owner(String name) {
    this.id = UUID.randomUUID();
    this.name = name;
  }

  public UUID getId() {
    return id;
  }

  public void setId(UUID id) {
    this.id = id;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
