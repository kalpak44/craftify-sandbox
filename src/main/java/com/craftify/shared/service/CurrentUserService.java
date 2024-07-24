package com.craftify.shared.service;

import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {
  public String getCurrentUserId() {
    var jwt = (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    var sub = jwt.getClaimAsString("sub");
    var split = sub.split("\\|");
    return split[split.length - 1];
  }
}
