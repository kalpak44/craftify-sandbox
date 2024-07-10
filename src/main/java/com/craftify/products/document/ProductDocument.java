package com.craftify.products.document;

import com.craftify.owners.document.OwnerDocument;
import com.craftify.shared.document.IdentifiedDocument;
import org.springframework.data.mongodb.core.mapping.DBRef;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class ProductDocument extends IdentifiedDocument<String> {

  @DBRef private OwnerDocument owner;

  private String name;

  public OwnerDocument getOwner() {
    return owner;
  }

  public void setOwner(OwnerDocument owner) {
    this.owner = owner;
  }

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
