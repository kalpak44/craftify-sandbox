package com.craftify.recipes.controller;

import com.craftify.recipes.dto.ApplyRecipeResponseDto;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.YieldResponseDto;
import com.craftify.recipes.service.RecipeService;
import com.craftify.shared.controller.CrudController;
import com.craftify.shared.exception.ApiException;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recipes")
@Tag(name = "Recipes")
public class RecipeController extends CrudController<RecipeDto, String> {
  private final RecipeService recipeService;

  protected RecipeController(RecipeService service, RecipeService recipeService) {
    super(service);
    this.recipeService = recipeService;
  }

  @GetMapping("/{id}/yield")
  @Operation(
      summary = "Calculate the yield of possible products by recipe",
      operationId = "getYieldByRecipeId")
  public YieldResponseDto getYieldByRecipeId(@PathVariable String id) {
    validateRecipeId(id);
    return recipeService.getYieldByRecipeId(id);
  }

  @PostMapping("/{id}/apply")
  @Operation(
      summary = "Apply the recipe with the specified count of products to cook",
      operationId = "applyRecipe")
  public ApplyRecipeResponseDto applyRecipe(@PathVariable String id, @RequestParam int count) {
    validateRecipeId(id);
    var yield = recipeService.getYieldByRecipeId(id);
    if (yield.getPossibleProducts() < count) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "The specified count of products exceeds the available yield.");
    }
    return recipeService.applyRecipe(id, count);
  }

  private void validateRecipeId(String id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    recipeService
        .findById(id)
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
  }
}
