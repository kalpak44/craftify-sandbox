package com.craftify.common.api;

import java.time.Instant;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

/**
 * Global exception handler for REST controllers. Intercepts uncaught exceptions and returns a
 * standardized error response.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

  /**
   * Handles all uncaught exceptions and returns a structured error response.
   *
   * @param ex the exception thrown
   * @return a ResponseEntity containing timestamp and error message
   */
  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponseDTO> handleGeneralException(Exception ex) {
    return ResponseEntity.badRequest().body(new ApiResponseDTO(Instant.now(), ex.getMessage()));
  }
}
