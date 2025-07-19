package com.craftify.bff.exception;

/** Custom exception representing an operation restriction (e.g. update/delete not allowed). */
public class OperationRestrictionException extends RuntimeException {
  public OperationRestrictionException(String message, Throwable cause) {
    super(message, cause);
  }
}
