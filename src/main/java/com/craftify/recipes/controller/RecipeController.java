package com.craftify.recipes.controller;

import com.craftify.recipes.dto.ApplyRequestDto;
import com.craftify.recipes.dto.ApplyResponseDto;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.ResultingProductDto;
import com.craftify.recipes.dto.YieldResponseDto;
import com.craftify.recipes.service.RecipeService;
import com.craftify.shared.controller.CrudController;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CurrentUserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.math.BigDecimal;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/recipes")
@Tag(name = "Recipes")
public class RecipeController extends CrudController<RecipeDto, String, SearchFilter> {
  private final RecipeService recipeService;

  protected RecipeController(
      RecipeService service, RecipeService recipeService, CurrentUserService currentUserService) {
    super(service, currentUserService);
    this.recipeService = recipeService;
  }

  @GetMapping("/{id}/yield")
  @Operation(
      summary = "Calculate the yield of possible products by recipe",
      operationId = "getYieldByRecipeId")
  public YieldResponseDto getYieldByRecipeId(@PathVariable String id) {
    validateRecipeId(id);
    return recipeService.getYieldByRecipeId(id, getCurrentUserId());
  }

  @PostMapping("/{id}/apply")
  @Operation(
          summary = "Apply the recipe to create a specified amount of the resulting product",
          operationId = "applyRecipeById")
  public ResponseEntity<ApplyResponseDto> applyRecipeById(
          @PathVariable String id, @RequestBody ApplyRequestDto applyRequestDto) {
    validateRecipeId(id);
    validateApplyRequestDto(applyRequestDto);
    return ResponseEntity.ok(recipeService.applyRecipeById(id, applyRequestDto.getAmount(), getCurrentUserId()));
  }

  private void validateApplyRequestDto(ApplyRequestDto applyRequestDto) {
    if (applyRequestDto == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Request is empty");
    }
    if (applyRequestDto.getAmount() == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Amount is empty");
    }
    if (applyRequestDto.getAmount().compareTo(BigDecimal.ZERO) <= 0) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Amount must be greater or equals than zero");
    }
  }

  private void validateRecipeId(String id) {
    if (id == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Path ID is required.");
    }
    recipeService
        .findById(id, getCurrentUserId())
        .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Document not found."));
  }
}
