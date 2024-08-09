package com.craftify.recipes.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.service.ProductSearchService;
import com.craftify.products.service.ProductService;
import com.craftify.recipes.document.RecipeStep;
import com.craftify.recipes.dto.ApplyResponseDto;
import com.craftify.recipes.dto.ResultingProductDto;
import com.craftify.recipes.exception.RecipeActionError;
import com.craftify.recipes.repository.RecipeRepository;
import com.craftify.recipes.service.actions.RecipeAction;
import com.craftify.shared.exception.ApiException;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class RecipeApplyService {
    private final RecipeRepository recipeRepository;
    private final ProductSearchService productSearchService;
    private final ProductService productService;
    private final ProductMergeService productMergeService;
    private final Set<RecipeAction> allAvailableRecipeActions;

    public RecipeApplyService(
            RecipeRepository recipeRepository,
            ProductSearchService productSearchService,
            ProductService productService,
            ProductMergeService productMergeService,
            Set<RecipeAction> recipeActions) {
        this.recipeRepository = recipeRepository;
        this.productSearchService = productSearchService;
        this.productService = productService;
        this.productMergeService = productMergeService;
        this.allAvailableRecipeActions = recipeActions;
    }

    public ApplyResponseDto applyRecipeById(String recipeId, BigDecimal amount, String currentUserId) {
        var optionalRecipe = recipeRepository.findByIdAndUserId(recipeId, currentUserId);
        if (optionalRecipe.isEmpty()) {
            throw new ApiException(HttpStatus.NOT_FOUND, "Recipe not found");
        }

        var recipeDocument = optionalRecipe.get();
        var resultErrors = new ArrayList<String>();

        var responseDto = new ApplyResponseDto();
        responseDto.setRecipeId(recipeDocument.getId());

        for (var recipeStep : recipeDocument.getRecipeSteps()) {
            var productSearch = recipeStep.getProductSearch();
            var matchingProducts = productSearchService.searchProducts(productSearch, currentUserId);

            if (matchingProducts.isEmpty()) {
                resultErrors.add("No matching products found for: " + productSearch.getProductName());
                continue;
            }


            for (var action : recipeStep.getActions()) {
                var recipeActions = allAvailableRecipeActions.stream()
                        .filter(supportedActions -> action.getType().equals(supportedActions.getType()))
                        .toList();

                for (var recipeAction : recipeActions) {
                    try {
                        recipeAction.apply(matchingProducts, action.getParameters(), amount);
                    } catch (RecipeActionError e) {
                        resultErrors.addAll(e.getErrors());
                    }
                }
            }
        }

        if (!resultErrors.isEmpty()) {
            responseDto.setIssues(resultErrors);
        }

        // After applying the actions, merge or create the resulting product
        var resultingProduct = recipeDocument.getResultingProduct();
        // Ensure to implement the mergeOrCreateProduct method to handle the resulting product based on the strategy
        // productMergeService.mergeOrCreateProduct(resultingProduct, amount, currentUserId);

        return responseDto;
    }
}


