package com.craftify.shared.exception;

import com.fasterxml.jackson.databind.JsonMappingException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;

@ControllerAdvice
public class GlobalExceptionHandler {

  private static final Logger logger = LoggerFactory.getLogger(GlobalExceptionHandler.class);

  @ExceptionHandler(ApiException.class)
  public ResponseEntity<ErrorResponse> handleApiException(ApiException ex) {
    ErrorResponse errorResponse =
        new ErrorResponse(
            ex.getStatus().value(), ex.getStatus().getReasonPhrase(), ex.getMessage());
    return new ResponseEntity<>(errorResponse, ex.getStatus());
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ErrorResponse> handleInternalServerError(Exception ex) {
    var internalServerError = "Internal Server Error";
    logger.error(internalServerError, ex);
    var message = ex.getMessage();
    ErrorResponse errorResponse =
        new ErrorResponse(
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(),
            message == null ? internalServerError : message);
    return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
  }
  @ExceptionHandler(JsonMappingException.class)
  public ResponseEntity<ErrorResponse> handleJsonMappingException(JsonMappingException ex) {
    logger.error("JSON Mapping Error", ex);
    ErrorResponse errorResponse =
            new ErrorResponse(
                    HttpStatus.BAD_REQUEST.value(),
                    HttpStatus.BAD_REQUEST.getReasonPhrase(),
                    "Invalid JSON input");
    return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
  }
}
