package com.craftify.recipes.service;

import com.craftify.recipes.document.AvailabilityCheckLogic;
import com.craftify.recipes.document.AvailabilityCondition;
import com.craftify.recipes.document.Measurement;
import com.craftify.recipes.document.RecipeDocument;
import com.craftify.recipes.document.ResultingProduct;
import com.craftify.recipes.document.SubtractionAction;
import com.craftify.recipes.document.SubtractionLogic;
import com.craftify.recipes.document.SubtractionMeasurement;
import com.craftify.recipes.dto.AvailabilityCheckLogicDto;
import com.craftify.recipes.dto.AvailabilityConditionDto;
import com.craftify.recipes.dto.MeasurementDto;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.recipes.dto.ResultingProductDto;
import com.craftify.recipes.dto.SubtractionActionDto;
import com.craftify.recipes.dto.SubtractionLogicDto;
import com.craftify.recipes.dto.SubtractionMeasurementDto;
import com.craftify.recipes.repository.RecipeRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import java.util.stream.Collectors;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class RecipeService extends CrudServiceAbstract<RecipeDocument, RecipeDto, String> {

  public RecipeService(RecipeRepository repository) {
    super(repository);
  }

  @Override
  protected RecipeDto toDto(RecipeDocument recipeDocument) throws ApiException {
    final var dto = new RecipeDto();
    dto.setId(recipeDocument.getId());
    dto.setAvailabilityCheckLogic(toDto(recipeDocument.getAvailabilityCheckLogic()));
    dto.setSubtractionLogic(toDto(recipeDocument.getSubtractionLogic()));
    dto.setResultingProduct(toDto(recipeDocument.getResultingProduct()));
    return dto;
  }

  @Override
  protected RecipeDocument toEntity(RecipeDto dto) throws ApiException {
    final var document = new RecipeDocument();
    document.setId(dto.getId());
    document.setAvailabilityCheckLogic(toEntity(dto.getAvailabilityCheckLogic()));
    document.setSubtractionLogic(toEntity(dto.getSubtractionLogic()));
    document.setResultingProduct(toEntity(dto.getResultingProduct()));
    return document;
  }

  private AvailabilityCheckLogicDto toDto(AvailabilityCheckLogic entity) {
    final var dto = new AvailabilityCheckLogicDto();
    dto.setConditions(entity.getConditions().stream().map(this::toDto).collect(Collectors.toSet()));
    return dto;
  }

  private AvailabilityCheckLogic toEntity(AvailabilityCheckLogicDto dto) {
    final var entity = new AvailabilityCheckLogic();
    entity.setConditions(
        dto.getConditions().stream().map(this::toEntity).collect(Collectors.toSet()));
    return entity;
  }

  private AvailabilityConditionDto toDto(AvailabilityCondition entity) {
    final var dto = new AvailabilityConditionDto();
    dto.setMeasurements(
        checkForNull(
                entity.getMeasurements(), "Measurements are required for AvailabilityCondition")
            .stream()
            .map(this::toDto)
            .collect(Collectors.toSet()));
    dto.setProductName(entity.getProductName());
    dto.setAttributes(entity.getAttributes());
    dto.setTags(entity.getTags());
    return dto;
  }

  private AvailabilityCondition toEntity(AvailabilityConditionDto dto) {
    final var entity = new AvailabilityCondition();
    entity.setMeasurements(
        checkForNull(dto.getMeasurements(), "Measurements are required for AvailabilityCondition")
            .stream()
            .map(this::toEntity)
            .collect(Collectors.toSet()));
    entity.setProductName(dto.getProductName());
    entity.setAttributes(dto.getAttributes());
    entity.setTags(dto.getTags());
    return entity;
  }

  private SubtractionLogicDto toDto(SubtractionLogic entity) {
    final var dto = new SubtractionLogicDto();
    dto.setActions(entity.getActions().stream().map(this::toDto).collect(Collectors.toSet()));
    return dto;
  }

  private SubtractionLogic toEntity(SubtractionLogicDto dto) {
    SubtractionLogic entity = new SubtractionLogic();
    entity.setActions(dto.getActions().stream().map(this::toEntity).collect(Collectors.toSet()));
    return entity;
  }

  private SubtractionActionDto toDto(SubtractionAction entity) {
    final var dto = new SubtractionActionDto();
    dto.setMeasurement(
        checkForNull(
            toDto(entity.getMeasurement()), "Measurement is required for SubtractionAction"));
    dto.setProductName(entity.getProductName());
    dto.setAttributes(entity.getAttributes());
    dto.setTags(entity.getTags());
    return dto;
  }

  private SubtractionAction toEntity(SubtractionActionDto dto) {
    final var entity = new SubtractionAction();
    entity.setMeasurement(
        checkForNull(
            toEntity(dto.getMeasurement()), "Measurement is required for SubtractionAction"));
    entity.setProductName(dto.getProductName());
    entity.setAttributes(dto.getAttributes());
    entity.setTags(dto.getTags());
    return entity;
  }

  private ResultingProductDto toDto(ResultingProduct entity) {
    final var dto = new ResultingProductDto();
    dto.setName(entity.getName());
    dto.setTags(entity.getTags());
    dto.setAttributes(entity.getAttributes());
    dto.setMeasurements(entity.getMeasurements());
    return dto;
  }

  private ResultingProduct toEntity(ResultingProductDto dto) {
    final var entity = new ResultingProduct();
    entity.setName(dto.getName());
    entity.setTags(dto.getTags());
    entity.setAttributes(dto.getAttributes());
    entity.setMeasurements(dto.getMeasurements());
    return entity;
  }

  private MeasurementDto toDto(Measurement entity) {
    final var dto = new MeasurementDto();
    dto.setType(checkForNull(entity.getType(), "Type is required for Measurement"));
    dto.setRequiredAmount(checkForNull(entity.getRequiredAmount(), "RequiredAmount is required for Measurement"));
    return dto;
  }

  private Measurement toEntity(MeasurementDto dto) {
    final var entity = new Measurement();
    entity.setType(checkForNull(dto.getType(), "Type is required for Measurement"));
    entity.setRequiredAmount(checkForNull(dto.getRequiredAmount(), "RequiredAmount is required for Measurement"));
    return entity;
  }


  private SubtractionMeasurementDto toDto(SubtractionMeasurement entity) {
    final var dto = new SubtractionMeasurementDto();
    dto.setType(checkForNull(entity.getType(), "Type is required for SubtractionMeasurement"));
    dto.setSubtractAmount(checkForNull(entity.getSubtractAmount(), "SubtractAmount is required for SubtractionMeasurement"));
    return dto;
  }

  private SubtractionMeasurement toEntity(SubtractionMeasurementDto dto) {
    final var entity = new SubtractionMeasurement();
    entity.setType(checkForNull(dto.getType(), "Type is required for SubtractionMeasurement"));
    entity.setSubtractAmount(checkForNull(dto.getSubtractAmount(), "SubtractAmount is required for SubtractionMeasurement"));
    return entity;
  }


  private <T> T checkForNull(T obj, String message) {
    if (obj == null) {
      throw new ApiException(HttpStatus.BAD_REQUEST, message);
    }
    return obj;
  }
}
