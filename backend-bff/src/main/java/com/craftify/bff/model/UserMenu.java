package com.craftify.bff.model;

import java.util.List;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "user_menus")
@CompoundIndex(def = "{'userId': 1, 'route': 1}", unique = true)
public record UserMenu(
    @Id String id,
    String userId,
    List<MenuPathElement> menuPath,
    String menuId,
    String menuLabel,
    String route) {
  public record MenuPathElement(String id, String label) {}
}
