package com.craftify.bff.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

/** Service for retrieving authentication details of the currently logged-in user. */
@Service
public class AuthentificationService {

  /**
   * Retrieves the subject (user ID) of the currently authenticated user from the Spring Security
   * context.
   *
   * @return the user ID (subject) from the JWT token
   */
  public String getCurrentUserId() {
    var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    return jwt.getSubject();
  }
}
