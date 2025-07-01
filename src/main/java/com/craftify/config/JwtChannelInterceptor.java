package com.craftify.config;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;

public class JwtChannelInterceptor implements ChannelInterceptor {
  private static final Logger logger = LoggerFactory.getLogger(JwtChannelInterceptor.class);
  private final JwtDecoder jwtDecoder;

  public JwtChannelInterceptor(@NonNull JwtDecoder jwtDecoder) {
    this.jwtDecoder = jwtDecoder;
  }

  @Override
  public Message<?> preSend(@NonNull Message<?> message, @NonNull MessageChannel channel) {
    var accessor = StompHeaderAccessor.wrap(message);

    if (StompCommand.CONNECT.equals(accessor.getCommand())) {
      var authHeaders = accessor.getNativeHeader("Authorization");

      if (authHeaders == null || authHeaders.isEmpty()) {
        logger.warn("STOMP CONNECT rejected: Missing Authorization header.");
        throw new AccessDeniedException("Missing Authorization header");
      }

      var rawToken = authHeaders.get(0);
      if (!rawToken.startsWith("Bearer ")) {
        logger.warn("STOMP CONNECT rejected: Malformed Authorization header: {}", rawToken);
        throw new AccessDeniedException("Malformed Authorization header");
      }

      var token = rawToken.replace("Bearer ", "");

      try {
        var jwt = jwtDecoder.decode(token);
        var username = jwt.getSubject();

        if (logger.isDebugEnabled()) {
          logger.debug("Authenticated STOMP user: {}", username);
        }

        var authentication =
            new UsernamePasswordAuthenticationToken(
                username, null, List.of() // Add roles if needed
                );

        accessor.setUser(authentication);
      } catch (JwtException e) {
        logger.warn("STOMP CONNECT rejected: Invalid JWT token: {}", e.getMessage());
        throw new AccessDeniedException("Invalid JWT token", e);
      }
    }

    return message;
  }
}
