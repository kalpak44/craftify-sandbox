package com.craftify.recipes.controller;

import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.service.RecipeService;
import com.craftify.shared.controller.CrudController;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recipes")
@Tag(name = "Recipes")
public class RecipeController extends CrudController<RecipeDto, String> {
  protected RecipeController(RecipeService service) {
    super(service);
  }
}
