package com.craftify.common.api;

//import com.craftify.schema.core.schema.SchemaCreationException;
//import com.craftify.schema.core.schema.SchemaRetrievingException;
//import org.springframework.http.ResponseEntity;
//import org.springframework.web.bind.annotation.ExceptionHandler;
//import org.springframework.web.bind.annotation.RestControllerAdvice;
//
//@RestControllerAdvice
//public class GlobalExceptionHandler {
//
//    @ExceptionHandler(SchemaCreationException.class)
//    public ResponseEntity<ApiResponseDTO> handleSchemaCreation(SchemaCreationException ex) {
//        return ResponseEntity
//                .badRequest()
//                .body(new ApiResponseDTO("Schema creation failed: " + ex.getMessage()));
//    }
//
//    @ExceptionHandler(SchemaRetrievingException.class)
//    public ResponseEntity<ApiResponseDTO> handleSchemaRetrieving(SchemaRetrievingException ex) {
//        return ResponseEntity
//                .badRequest()
//                .body(new ApiResponseDTO("Schema retrieving failed: " + ex.getMessage()));
//    }
//}
