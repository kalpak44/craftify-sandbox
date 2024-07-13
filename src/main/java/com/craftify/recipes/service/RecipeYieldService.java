package com.craftify.recipes.service;

import com.craftify.recipes.dto.ApplyRecipeResponseDto;
import com.craftify.recipes.dto.YieldResponseDto;
import org.springframework.stereotype.Service;

@Service
public class RecipeYieldService {
  public YieldResponseDto calculateYieldByRecipeId(String recipeId) {
    final var yield = new YieldResponseDto();
    yield.setRecipeId(recipeId);
    // todo: implement me
    return yield;
  }

  public ApplyRecipeResponseDto applyYieldByRecipeId(String recipeId, int count) {
    final var applyStatus = new ApplyRecipeResponseDto();
    applyStatus.setRecipeId(recipeId);
    applyStatus.setApplyCount(count);
    // todo: implement me
    return applyStatus;
  }
}
