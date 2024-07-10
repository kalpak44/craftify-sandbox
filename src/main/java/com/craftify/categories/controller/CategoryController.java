package com.craftify.categories.controller;

import com.craftify.categories.dto.CategoryDto;
import com.craftify.categories.service.CategoryService;
import com.craftify.shared.controller.CrudController;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/categories")
@Tag(name = "Categories")
public class CategoryController extends CrudController<CategoryDto, String> {

  public CategoryController(CategoryService service) {
    super(service);
  }
}
