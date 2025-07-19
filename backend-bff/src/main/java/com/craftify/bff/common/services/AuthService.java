package com.craftify.bff.common.services;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

/**
 * Service for retrieving authentication-related information. Currently, provides access to the
 * authenticated user's ID.
 */
@Component
public class AuthService {

  /**
   * Retrieves the user ID (subject) from the current JWT in the security context.
   *
   * @return the subject claim from the JWT, representing the user ID
   * @throws ClassCastException if the principal is not a Jwt instance
   */
  public String getCurrentUserId() {
    var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return jwt.getSubject();
  }
}
