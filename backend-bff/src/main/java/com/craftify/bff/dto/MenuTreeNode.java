package com.craftify.bff.dto;

import com.craftify.bff.model.UserMenu;

import java.util.ArrayList;
import java.util.List;

public record MenuTreeNode(
        String id,
        String label,
        List<MenuTreeNode> children,
        UserMenu leafMenu
) {
    public MenuTreeNode(String id, String label) {
        this(id, label, new ArrayList<>(), null);
    }
    public MenuTreeNode(String id, String label, List<MenuTreeNode> children) {
        this(id, label, children, null);
    }
}