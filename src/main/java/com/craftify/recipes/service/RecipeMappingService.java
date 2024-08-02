package com.craftify.recipes.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.document.Action;
import com.craftify.recipes.document.ProductSearch;
import com.craftify.recipes.document.RecipeDocument;
import com.craftify.recipes.document.RecipeStep;
import com.craftify.recipes.document.ResultingProduct;
import com.craftify.recipes.dto.ActionDto;
import com.craftify.recipes.dto.ProductSearchDto;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.RecipeItemDto;
import com.craftify.recipes.dto.ResultingProductDto;
import com.craftify.recipes.service.actions.RecipeAction;
import com.craftify.shared.exception.ApiException;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RecipeMappingService {

  private final Set<RecipeAction> recipeActions;

  public RecipeMappingService(Set<RecipeAction> recipeActions) {
    this.recipeActions = recipeActions;
  }

  public RecipeDto toDto(RecipeDocument recipe) throws ApiException {
    validateRecipe(recipe);
    var dto = new RecipeDto();
    dto.setId(recipe.getId());
    validateRecipe(recipe);
    dto.setRecipeName(recipe.getRecipeName());
    dto.setRecipe(recipe.getRecipeSteps().stream().map(this::toDto).collect(Collectors.toList()));
    dto.setResultingProduct(toDto(recipe.getResultingProduct()));
    return dto;
  }

  public RecipeDocument toEntity(RecipeDto dto) throws ApiException {
    validateRecipeDto(dto);
    var recipe = new RecipeDocument();
    recipe.setId(dto.getId());
    validateRecipeDto(dto);
    recipe.setRecipeName(dto.getRecipeName());
    recipe.setRecipeSteps(
        dto.getRecipe().stream().map(this::toEntity).collect(Collectors.toList()));
    recipe.setResultingProduct(toEntity(dto.getResultingProduct()));
    return recipe;
  }

  public ProductDocument convertToProductDocument(ResultingProduct resultingProduct) {
    ProductDocument productDocument = new ProductDocument();
    productDocument.setName(resultingProduct.getName());
    productDocument.setTags(resultingProduct.getTags());
    productDocument.setAttributes(resultingProduct.getAttributes());
    productDocument.setMeasurements(resultingProduct.getMeasurements());
    return productDocument;
  }

  private RecipeItemDto toDto(RecipeStep entity) {
    var dto = new RecipeItemDto();
    validateRecipeStepName(entity);
    dto.setIngredientName(entity.getIngredientName());
    dto.setProductSearch(toDto(entity.getProductSearch()));
    dto.setActions(entity.getActions().stream().map(this::toDto).collect(Collectors.toList()));
    return dto;
  }

  private RecipeStep toEntity(RecipeItemDto dto) {
    var entity = new RecipeStep();
    validateRecipeStepName(dto);
    entity.setIngredientName(dto.getIngredientName());
    entity.setProductSearch(toEntity(dto.getProductSearch()));
    entity.setActions(dto.getActions().stream().map(this::toEntity).collect(Collectors.toList()));
    return entity;
  }

  private ProductSearchDto toDto(ProductSearch entity) {
    validateProductSearch(entity);
    var dto = new ProductSearchDto();
    dto.setProductName(entity.getProductName());
    dto.setAttributes(entity.getAttributes());
    dto.setTags(entity.getTags());
    return dto;
  }

  private ProductSearch toEntity(ProductSearchDto dto) {
    validateProductSearchDto(dto);
    var entity = new ProductSearch();
    entity.setProductName(dto.getProductName());
    entity.setAttributes(dto.getAttributes());
    entity.setTags(dto.getTags());
    return entity;
  }

  private ActionDto toDto(Action entity) {
    validateAction(entity);
    var dto = new ActionDto();
    dto.setType(entity.getType());
    dto.setParameters(entity.getParameters());
    return dto;
  }

  private Action toEntity(ActionDto dto) {
    validateActionDto(dto);
    Action entity = new Action();
    entity.setType(dto.getType());
    entity.setParameters(dto.getParameters());
    return entity;
  }

  private ResultingProductDto toDto(ResultingProduct entity) {
    validateResultingProduct(entity);
    ResultingProductDto dto = new ResultingProductDto();
    dto.setName(entity.getName());
    dto.setTags(entity.getTags());
    dto.setAttributes(entity.getAttributes());
    dto.setMeasurements(entity.getMeasurements());
    dto.setCategories(entity.getCategories());
    return dto;
  }

  private ResultingProduct toEntity(ResultingProductDto dto) {
    validateResultingProductDto(dto);
    var entity = new ResultingProduct();
    entity.setName(dto.getName());
    entity.setTags(dto.getTags());
    entity.setAttributes(dto.getAttributes());
    entity.setMeasurements(dto.getMeasurements());
    entity.setCategories(dto.getCategories());
    return entity;
  }

  private void validateRecipeStepName(RecipeStep recipeStep){
    if(StringUtils.isBlank(recipeStep.getIngredientName())){
      throw new ApiException(HttpStatus.BAD_REQUEST, "Ingredient name is required");
    }
  }
  private void validateRecipeStepName(RecipeItemDto recipeStep){
    if(StringUtils.isBlank(recipeStep.getIngredientName())){
      throw new ApiException(HttpStatus.BAD_REQUEST, "Ingredient name is required");
    }
  }

  private void validateProductSearch(ProductSearch productSearch) {
    if (StringUtils.isEmpty(productSearch.getProductName())
        && (productSearch.getAttributes() == null || productSearch.getAttributes().isEmpty())
        && (productSearch.getTags() == null || productSearch.getTags().isEmpty())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "ProductSearch must contain productName or non-empty attributes or non-empty tags");
    }
  }

  private void validateProductSearchDto(ProductSearchDto productSearchDto) {
    if (StringUtils.isEmpty(productSearchDto.getProductName())
        && (productSearchDto.getAttributes() == null || productSearchDto.getAttributes().isEmpty())
        && (productSearchDto.getTags() == null || productSearchDto.getTags().isEmpty())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "ProductSearchDto must contain productName or non-empty attributes or non-empty tags");
    }
  }

  private void validateAction(Action action) {
    var actionOptional =
        recipeActions.stream()
            .filter(
                supportedActions ->
                    action != null
                        && action.getType() != null
                        && action.getType().equals(supportedActions.getType()))
            .findFirst();
    if (actionOptional.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported action type");
    }
    var recipeAction = actionOptional.get();
    recipeAction.validateParameters(action.getParameters());
  }

  private void validateActionDto(ActionDto actionDto) {
    var actionOptional =
        recipeActions.stream()
            .filter(
                supportedActions ->
                    actionDto != null
                        && actionDto.getType() != null
                        && actionDto.getType().equals(supportedActions.getType()))
            .findFirst();
    if (actionOptional.isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Unsupported action type");
    }
    var recipeAction = actionOptional.get();
    recipeAction.validateParameters(actionDto.getParameters());
  }

  private void validateResultingProduct(ResultingProduct resultingProduct) {
    if (StringUtils.isEmpty(resultingProduct.getName())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "ResultingProduct must contain a name");
    }
  }

  private void validateResultingProductDto(ResultingProductDto resultingProductDto) {
    if (StringUtils.isEmpty(resultingProductDto.getName())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "ResultingProductDto must contain a name");
    }
  }

  private void validateRecipe(RecipeDocument recipe) {
    if (recipe.getRecipeSteps() == null || recipe.getRecipeSteps().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Recipe must contain at least one entry");
    }
  }

  private void validateRecipeDto(RecipeDto recipeDto) {
    if (recipeDto.getRecipe() == null || recipeDto.getRecipe().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "RecipeDto must contain at least one entry");
    }
  }

  private void validateRecipeName(RecipeDocument recipeDocument) {
    if (recipeDocument.getRecipeName() == null || recipeDocument.getRecipeName().isBlank()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "RecipeDocument must contain a name");
    }
  }
  private void validateRecipeNameDto(RecipeDto recipeDto){
    if(recipeDto.getRecipeName() == null || recipeDto.getRecipeName().isBlank()){
      throw new ApiException(HttpStatus.BAD_REQUEST, "RecipeDto must contain a name");
    }
  }
}
