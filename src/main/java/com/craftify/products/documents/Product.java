package com.craftify.products.documents;

import com.craftify.owners.documents.Owner;
import com.craftify.shared.document.IdentifiedDocument;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Product extends IdentifiedDocument<String> {

  @DBRef private Owner owner;

  private String name;

  public Owner getOwner() {
    return owner;
  }

  public void setOwner(Owner owner) {
    this.owner = owner;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
