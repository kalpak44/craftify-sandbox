package com.craftify.owners.document;

import com.craftify.shared.document.IdentifiedDocument;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class OwnerDocument extends IdentifiedDocument<String> {
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
