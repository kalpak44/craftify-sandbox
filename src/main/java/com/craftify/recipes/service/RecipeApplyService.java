package com.craftify.recipes.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.repository.ProductRepository;
import com.craftify.products.service.ProductSearchService;
import com.craftify.recipes.document.ResultingProduct;
import com.craftify.recipes.dto.ApplyResponseDto;
import com.craftify.recipes.exception.RecipeActionError;
import com.craftify.recipes.repository.RecipeRepository;
import com.craftify.recipes.service.actions.RecipeAction;
import com.craftify.shared.dto.ResultMode;
import com.craftify.shared.exception.ApiException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Set;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RecipeApplyService {
  private final RecipeRepository recipeRepository;
  private final ProductSearchService productSearchService;
  private final ProductRepository productRepository;
  private final ProductMergeService productMergeService;
  private final Set<RecipeAction> allAvailableRecipeActions;

  public RecipeApplyService(
      RecipeRepository recipeRepository,
      ProductSearchService productSearchService,
      ProductRepository productRepository,
      ProductMergeService productMergeService,
      Set<RecipeAction> recipeActions) {
    this.recipeRepository = recipeRepository;
    this.productSearchService = productSearchService;
    this.productRepository = productRepository;
    this.productMergeService = productMergeService;
    this.allAvailableRecipeActions = recipeActions;
  }

  public ApplyResponseDto applyRecipeById(
      String recipeId, BigDecimal amount, String currentUserId) {
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
        var recipeActions =
            allAvailableRecipeActions.stream()
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
    if (resultingProduct.getMode() == ResultMode.CREATE_NEW) {
      var productDocument =
          setProductDocumentProperties(new ProductDocument(), currentUserId, resultingProduct);
      productRepository.save(productDocument);
    } else if (resultingProduct.getMode() == ResultMode.REPLACE_EXISTING) {
      var productDocumentOptional =
          productRepository.findByIdAndUserId(resultingProduct.getId(), currentUserId);
      if (productDocumentOptional.isEmpty()) {
        throw new ApiException(
            HttpStatus.BAD_REQUEST,
            "Product with id: \"" + resultingProduct.getId() + "\" not found");
      }
      var productDocument =
          setProductDocumentProperties(
              productDocumentOptional.get(), currentUserId, resultingProduct);
      productRepository.save(productDocument);

    } else if (resultingProduct.getMode() == ResultMode.MERGE) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Still not implemented");

    } else {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported mode were passed");
    }

    return responseDto;
  }

  private static ProductDocument setProductDocumentProperties(
      ProductDocument productDocument, String currentUserId, ResultingProduct resultingProduct) {
    productDocument.setUserId(currentUserId);
    productDocument.setName(resultingProduct.getName());
    productDocument.setAttributes(resultingProduct.getAttributes());
    productDocument.setTags(resultingProduct.getTags());
    productDocument.setMeasurements(resultingProduct.getMeasurements());
    productDocument.setAvailability(resultingProduct.getAvailability());
    productDocument.setCategories(resultingProduct.getCategories());
    return productDocument;
  }
}
