package com.craftify.recipes.service;

import com.craftify.recipes.document.Action;
import com.craftify.recipes.document.Measurement;
import com.craftify.recipes.document.ProductSearch;
import com.craftify.recipes.document.RecipeDocument;
import com.craftify.recipes.document.RecipeItem;
import com.craftify.recipes.document.ResultingProduct;
import com.craftify.recipes.dto.ActionDto;
import com.craftify.recipes.dto.MeasurementDto;
import com.craftify.recipes.dto.ProductSearchDto;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.RecipeItemDto;
import com.craftify.recipes.dto.ResultingProductDto;
import com.craftify.shared.exception.ApiException;
import java.util.Set;
import java.util.stream.Collectors;
import org.apache.commons.lang3.StringUtils;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RecipeMappingService {
  private static final Set<String> VALID_ACTION_TYPES = Set.of("subtraction");

  public RecipeDto toDto(RecipeDocument recipe) throws ApiException {
    validateRecipe(recipe);
    var dto = new RecipeDto();
    dto.setId(recipe.getId());
    dto.setRecipe(recipe.getRecipe().stream().map(this::toDto).collect(Collectors.toList()));
    dto.setResultingProduct(toDto(recipe.getResultingProduct()));
    return dto;
  }

  public RecipeDocument toEntity(RecipeDto dto) throws ApiException {
    validateRecipeDto(dto);
    var recipe = new RecipeDocument();
    recipe.setId(dto.getId());
    recipe.setRecipe(dto.getRecipe().stream().map(this::toEntity).collect(Collectors.toList()));
    recipe.setResultingProduct(toEntity(dto.getResultingProduct()));
    return recipe;
  }

  private RecipeItemDto toDto(RecipeItem entity) {
    var dto = new RecipeItemDto();
    dto.setProductSearch(toDto(entity.getProductSearch()));
    dto.setActions(entity.getActions().stream().map(this::toDto).collect(Collectors.toList()));
    return dto;
  }

  private RecipeItem toEntity(RecipeItemDto dto) {
    var entity = new RecipeItem();
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
    dto.setMeasurement(toDto(entity.getMeasurement()));
    return dto;
  }

  private Action toEntity(ActionDto dto) {
    validateActionDto(dto);
    Action entity = new Action();
    entity.setType(dto.getType());
    entity.setMeasurement(toEntity(dto.getMeasurement()));
    return entity;
  }

  private MeasurementDto toDto(Measurement entity) {
    validateMeasurement(entity);
    var dto = new MeasurementDto();
    dto.setType(entity.getType());
    dto.setAmount(entity.getAmount());
    dto.setUnit(entity.getUnit());
    return dto;
  }

  private Measurement toEntity(MeasurementDto dto) {
    validateMeasurementDto(dto);
    Measurement entity = new Measurement();
    entity.setType(dto.getType());
    entity.setAmount(dto.getAmount());
    entity.setUnit(dto.getUnit());
    return entity;
  }

  private ResultingProductDto toDto(ResultingProduct entity) {
    validateResultingProduct(entity);
    ResultingProductDto dto = new ResultingProductDto();
    dto.setName(entity.getName());
    dto.setTags(entity.getTags());
    dto.setAttributes(entity.getAttributes());
    dto.setMeasurements(entity.getMeasurements());
    return dto;
  }

  private ResultingProduct toEntity(ResultingProductDto dto) {
    validateResultingProductDto(dto);
    var entity = new ResultingProduct();
    entity.setName(dto.getName());
    entity.setTags(dto.getTags());
    entity.setAttributes(dto.getAttributes());
    entity.setMeasurements(dto.getMeasurements());
    return entity;
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
    if (!VALID_ACTION_TYPES.contains(action.getType())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid action type: " + action.getType());
    }
    validateMeasurement(action.getMeasurement());
  }

  private void validateActionDto(ActionDto actionDto) {
    if (!VALID_ACTION_TYPES.contains(actionDto.getType())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Invalid action type: " + actionDto.getType());
    }
    validateMeasurementDto(actionDto.getMeasurement());
  }

  private void validateMeasurement(Measurement measurement) {
    if (measurement == null
        || StringUtils.isEmpty(measurement.getType())
        || measurement.getAmount() == null
        || StringUtils.isEmpty(measurement.getUnit())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Measurement must contain type, amount (valid number), and unit");
    }
  }

  private void validateMeasurementDto(MeasurementDto measurementDto) {
    if (measurementDto == null
        || StringUtils.isEmpty(measurementDto.getType())
        || measurementDto.getAmount() == null
        || StringUtils.isEmpty(measurementDto.getUnit())) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST,
          "MeasurementDto must contain type, amount (valid number), and unit");
    }
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
    if (recipe.getRecipe() == null || recipe.getRecipe().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Recipe must contain at least one entry");
    }
  }

  private void validateRecipeDto(RecipeDto recipeDto) {
    if (recipeDto.getRecipe() == null || recipeDto.getRecipe().isEmpty()) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "RecipeDto must contain at least one entry");
    }
  }
}
