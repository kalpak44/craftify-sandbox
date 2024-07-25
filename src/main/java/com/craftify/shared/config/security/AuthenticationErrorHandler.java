package com.craftify.shared.config.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.stereotype.Component;

@Component
public class AuthenticationErrorHandler implements AuthenticationEntryPoint {

  private final ObjectMapper objectMapper;

  public AuthenticationErrorHandler(ObjectMapper objectMapper) {
    this.objectMapper = objectMapper;
  }

  @Override
  public void commence(
      final HttpServletRequest request,
      final HttpServletResponse response,
      final AuthenticationException authException)
      throws IOException {
    response.setStatus(HttpStatus.UNAUTHORIZED.value());
    response.setContentType(MediaType.APPLICATION_JSON_VALUE);

    var errorResponse = new ErrorResponse(authException.getMessage());

    // Write the JSON response using ObjectMapper
    response.getWriter().write(objectMapper.writeValueAsString(errorResponse));
    response.flushBuffer();
  }

  public record ErrorResponse(String error) {}
}
