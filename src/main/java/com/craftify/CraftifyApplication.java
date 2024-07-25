package com.craftify;

import io.swagger.v3.oas.annotations.OpenAPIDefinition;
import io.swagger.v3.oas.annotations.enums.SecuritySchemeType;
import io.swagger.v3.oas.annotations.info.Info;
import io.swagger.v3.oas.annotations.security.SecurityScheme;
import io.swagger.v3.oas.annotations.servers.Server;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.mongodb.repository.config.EnableMongoRepositories;

@SpringBootApplication
@SecurityScheme(
    name = "bearerAuthorization",
    type = SecuritySchemeType.HTTP,
    bearerFormat = "JWT",
    scheme = "bearer")
@OpenAPIDefinition(
    info = @Info(title = "Craftify API", version = "v1"),
    servers = {@Server(url = "http://localhost:8080")})
@EnableMongoRepositories
public class CraftifyApplication {

  public static void main(String[] args) {
    SpringApplication.run(CraftifyApplication.class, args);
  }
}
