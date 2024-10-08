package com.craftify.recipes.service.actions;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.repository.ProductRepository;
import com.craftify.recipes.exception.RecipeActionError;
import com.craftify.recipes.models.Pair;
import com.craftify.shared.exception.ApiException;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;

@Component
public class ReduceAvailabilityAction implements RecipeAction {

  private final ProductRepository productRepository;

  public ReduceAvailabilityAction(ProductRepository productRepository) {
    this.productRepository = productRepository;
  }

  @Override
  public String getType() {
    return "subtraction";
  }

  @Override
  public void validateParameters(Map<String, Object> parameters) throws ApiException {
    if (parameters == null
        || parameters.get("amount") == null
        || parameters.get("unit") == null
        || parameters.get("type") == null) {
      throw new ApiException(
          HttpStatus.BAD_REQUEST, "Missing required parameters 'amount' or 'unit' or 'type'");
    }
    if (!(parameters.get("amount") instanceof Integer
        || parameters.get("amount") instanceof Double)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "amount must be a number");
    }
    if (!(parameters.get("unit") instanceof String)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "unit must be a string");
    }
    if (!(parameters.get("type") instanceof String)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "type must be a string");
    }
  }

  @Override
  public BigDecimal calculateNewYield(
      List<ProductDocument> recipeStepProducts,
      Map<String, Object> actionParameters,
      BigDecimal currentYield)
      throws RecipeActionError {
    var requiredAmount = new BigDecimal(String.valueOf(actionParameters.get("amount")));
    var requiredUnit = (String) actionParameters.get("unit");
    var availabilityType = (String) actionParameters.get("type");
    var errors = new ArrayList<String>();

    if (requiredAmount.compareTo(BigDecimal.ZERO) < 0) {
      errors.add("Required amount cannot be negative: " + requiredAmount);
    }

    var totalAvailable = BigDecimal.ZERO;
    for (var product : recipeStepProducts) {
      var availability = product.getAvailability().get(availabilityType);

      if (availability == null) {
        errors.add(
            "No availability for type: "
                + availabilityType
                + " in product: "
                + product.getName()
                + " ("
                + product.getId()
                + ")");
        continue;
      }

      var productUnit = availability.getUnit();
      if (requiredUnit.equals(productUnit)) {
        totalAvailable = totalAvailable.add(availability.getValue());
      } else {
        try {
          var convertedAmount = convertUnits(availability.getValue(), productUnit, requiredUnit);
          totalAvailable = totalAvailable.add(convertedAmount);
        } catch (IllegalArgumentException e) {
          errors.add(
              "Cannot convert "
                  + productUnit
                  + " to "
                  + requiredUnit
                  + " for product: "
                  + product.getName()
                  + " ("
                  + product.getId()
                  + ")");
        }
      }
    }

    if (totalAvailable.compareTo(BigDecimal.ZERO) == 0) {
      errors.add(
          "No availability for type: " + availabilityType + " in required unit: " + requiredUnit);
    }

    if (requiredAmount.compareTo(BigDecimal.ZERO) == 0) {
      errors.add("Required amount cannot be zero.");
    }

    if (!errors.isEmpty()) {
      throw new RecipeActionError(errors);
    }

    var newPotentialYield = totalAvailable.divide(requiredAmount, 0, RoundingMode.FLOOR);
    return currentYield.min(newPotentialYield);
  }

  @Override
  public void apply(
          List<ProductDocument> matchingProducts, Map<String, Object> parameters, BigDecimal amount)
          throws RecipeActionError {

    var requiredAmountPerPortion = new BigDecimal(String.valueOf(parameters.get("amount")));
    var requiredUnit = (String) parameters.get("unit");
    var availabilityType = (String) parameters.get("type");

    // Calculate the total required amount for the given number of portions
    var totalRequired = requiredAmountPerPortion.multiply(amount);
    var errors = new ArrayList<String>();

    var totalExtractable = BigDecimal.ZERO;
    var totalExtracted = BigDecimal.ZERO;

    // First pass: Calculate the total extractable amount
    for (var matchingProduct : matchingProducts) {
      var availabilities = matchingProduct.getAvailability();
      var availability = availabilities.get(availabilityType);

      if (availability == null) {
        errors.add(
                "No availability for type: "
                        + availabilityType
                        + " in product: "
                        + matchingProduct.getName());
        continue;
      }

      var availableAmount = availability.getValue();
      var productUnit = availability.getUnit();

      if (requiredUnit.equals(productUnit)) {
        totalExtractable = totalExtractable.add(availableAmount);
      } else {
        try {
          var convertedAmount = convertUnits(availableAmount, productUnit, requiredUnit);
          totalExtractable = totalExtractable.add(convertedAmount);
        } catch (IllegalArgumentException e) {
          errors.add(
                  "Cannot convert "
                          + productUnit
                          + " to "
                          + requiredUnit
                          + " in product: "
                          + matchingProduct.getName());
        }
      }
    }

    // Check if the total extractable amount is sufficient
    if (totalExtractable.compareTo(totalRequired) < 0) {
      errors.add("Insufficient total availability across all products for type: "
              + availabilityType + " in required unit: " + requiredUnit);
      throw new RecipeActionError(errors);
    }

    // Second pass: Perform the actual extraction
    for (var matchingProduct : matchingProducts) {
      if (totalExtracted.compareTo(totalRequired) >= 0) {
        break;
      }
      var availabilities = matchingProduct.getAvailability();
      var availability = availabilities.get(availabilityType);

      // Handle null availability case, should have been handled earlier but kept for safety
      if (availability == null) {
        continue;
      }

      var availableAmount = availability.getValue();
      var productUnit = availability.getUnit();

      BigDecimal extractableAmount;

      if (requiredUnit.equals(productUnit)) {
        extractableAmount = availableAmount.min(totalRequired.subtract(totalExtracted));
      } else {
        try {
          var convertedAmount = convertUnits(availableAmount, productUnit, requiredUnit);
          extractableAmount = convertedAmount.min(totalRequired.subtract(totalExtracted));
        } catch (IllegalArgumentException e) {
          errors.add(
                  "Cannot convert "
                          + productUnit
                          + " to "
                          + requiredUnit
                          + " in product: "
                          + matchingProduct.getName());
          continue;
        }
      }

      if (extractableAmount.compareTo(BigDecimal.ZERO) > 0) {
        totalExtracted = totalExtracted.add(extractableAmount);

        var newAvailableAmount = availableAmount.subtract(extractableAmount);
        availability.setValue(newAvailableAmount);

        if (totalExtracted.compareTo(totalRequired) >= 0) {
          break;
        }
      }

      availabilities.put(availabilityType, availability); // Save updated availability back to the product
    }

    if (!errors.isEmpty()) {
      throw new RecipeActionError(errors);
    }

    // Save the changes made to the products
    productRepository.saveAll(matchingProducts);
  }


  private BigDecimal convertUnits(BigDecimal amount, String fromUnit, String toUnit) {
    /*    if (fromUnit.equals("g") && toUnit.equals("kg")) {
      return amount.divide(BigDecimal.valueOf(1000), RoundingMode.HALF_UP);
    } else if (fromUnit.equals("kg") && toUnit.equals("g")) {
      return amount.multiply(BigDecimal.valueOf(1000));
    } else if (fromUnit.equals("ml") && toUnit.equals("l")) {
      return amount.divide(BigDecimal.valueOf(1000), RoundingMode.HALF_UP);
    } else if (fromUnit.equals("l") && toUnit.equals("ml")) {
      return amount.multiply(BigDecimal.valueOf(1000));
    } else {
      throw new IllegalArgumentException("Unsupported unit conversion: " + fromUnit + " to " + toUnit);
    }*/

    if (!fromUnit.equals(toUnit)) {
      throw new IllegalArgumentException(
          "Unsupported unit conversion: " + fromUnit + " to " + toUnit);
    }

    return amount;
  }
}
