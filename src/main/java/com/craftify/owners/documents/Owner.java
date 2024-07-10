package com.craftify.owners.documents;

import com.craftify.shared.document.IdentifiedDocument;
import org.springframework.data.mongodb.core.mapping.Document;

@Document
public class Owner extends IdentifiedDocument<String> {
  private String name;

  public String getName() {
    return name;
  }

  public void setName(String name) {
    this.name = name;
  }
}
