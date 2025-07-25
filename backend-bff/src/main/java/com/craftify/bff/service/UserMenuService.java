package com.craftify.bff.service;

import com.craftify.bff.dto.MenuTreeNode;
import com.craftify.bff.model.UserMenu;
import com.craftify.bff.repository.UserMenuRepository;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DuplicateKeyException;
import org.springframework.stereotype.Service;

@Service
public class UserMenuService {

  private final UserMenuRepository userMenuRepository;

  @Autowired
  public UserMenuService(
      UserMenuRepository userMenuRepository, AuthentificationService authentificationService) {
    this.userMenuRepository = userMenuRepository;
  }

  public List<UserMenu> saveMenus(List<UserMenu> menus, String userId) {
    for (UserMenu menu : menus) {
      userMenuRepository
          .findByUserIdAndRoute(userId, menu.route())
          .ifPresent(
              existing -> {
                throw new IllegalArgumentException(
                    "This route is already used for this user: " + menu.route());
              });
    }
    List<UserMenu> toSave =
        menus.stream()
            .map(
                menu ->
                    new UserMenu(
                        null,
                        userId,
                        menu.menuPath(),
                        menu.menuId(),
                        menu.menuLabel(),
                        menu.route()))
            .toList();

    try {
      return userMenuRepository.saveAll(toSave);
    } catch (DuplicateKeyException ex) {
      throw new IllegalArgumentException(
          "One or more menu routes are already taken for this user.");
    }
  }

  public MenuTreeNode buildMenuTree(String userId) {
    List<UserMenu> menus = userMenuRepository.findByUserId(userId);
    return buildMenuTree(menus);
  }

  public MenuTreeNode buildMenuTree(List<UserMenu> menus) {
    MenuTreeNode root = new MenuTreeNode("root", "root", new ArrayList<>(), null);

    for (UserMenu menu : menus) {
      List<UserMenu.MenuPathElement> path = menu.menuPath();
      MenuTreeNode current = root;

      for (UserMenu.MenuPathElement segment : path) {
        Optional<MenuTreeNode> existingChild =
            current.children().stream()
                .filter(child -> child.id().equals(segment.id()))
                .findFirst();

        if (existingChild.isPresent()) {
          current = existingChild.get();
        } else {
          MenuTreeNode newNode =
              new MenuTreeNode(segment.id(), segment.label(), new ArrayList<>(), null);
          current.children().add(newNode);
          current = newNode;
        }
      }
      // Attach the menu at the leaf
      MenuTreeNode leafNode =
          new MenuTreeNode(current.id(), current.label(), current.children(), menu);
      // Replace the last child with the leafNode containing the menu (preserve children if
      // necessary)
      // Remove old reference from parent's children and add leafNode
      if (current != root) {
        MenuTreeNode parent = findParent(root, path);
        if (parent != null) {
          MenuTreeNode finalCurrent = current;
          parent.children().removeIf(child -> child.id().equals(finalCurrent.id()));
          parent.children().add(leafNode);
        }
      }
    }
    return root;
  }

  // Helper: finds the parent node given the path (minus last segment)
  private MenuTreeNode findParent(MenuTreeNode root, List<UserMenu.MenuPathElement> path) {
    MenuTreeNode current = root;
    for (int i = 0; i < path.size() - 1; i++) {
      String segmentId = path.get(i).id();
      Optional<MenuTreeNode> child =
          current.children().stream().filter(c -> c.id().equals(segmentId)).findFirst();
      if (child.isEmpty()) return null;
      current = child.get();
    }
    return current;
  }
}
