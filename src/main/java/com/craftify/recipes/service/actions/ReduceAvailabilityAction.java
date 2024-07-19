package com.craftify.recipes.service.actions;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.exception.RecipeActionError;
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
    if (!(parameters.get("amount") instanceof Integer)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "'amount' must be a number");
    }
    if (!(parameters.get("unit") instanceof String)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "'unit' must be a string");
    }
    if (!(parameters.get("type") instanceof String)) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "'type' must be a string");
    }
  }

  @Override
  public BigDecimal calculateNewYield(
      List<ProductDocument> recipeStepProducts,
      Map<String, Object> actionParameters,
      BigDecimal currentYield)
      throws RecipeActionError {
    var requiredAmount = new BigDecimal((Integer) actionParameters.get("amount"));
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

      for (var entry : availability.entrySet()) {
        var productUnit = entry.getValue();
        if (requiredUnit.equals(productUnit)) {
          totalAvailable = totalAvailable.add(entry.getKey());
        } else {
          try {
            var convertedAmount = convertUnits(entry.getKey(), productUnit, requiredUnit);
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
