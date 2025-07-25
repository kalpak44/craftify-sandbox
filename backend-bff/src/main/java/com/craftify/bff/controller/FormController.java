package com.craftify.bff.controller;

import com.craftify.bff.config.EventProducerConfig;
import com.craftify.bff.dto.UserFormDto;
import com.craftify.bff.model.Event;
import com.craftify.bff.model.Form;
import com.craftify.bff.service.AuthentificationService;
import com.craftify.bff.service.UserFormService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.util.Map;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.util.UriComponentsBuilder;

@RestController
@RequestMapping("/forms")
@Tag(name = "User Forms Management", description = "CRUD operations for managing user forms")
public class FormController {
  private final AuthentificationService authentificationService;
  private final UserFormService userFormService;
  private final HttpClient httpClient;
  private final EventProducerConfig eventProducerConfig;
  private final ObjectMapper objectMapper;

  public FormController(
      AuthentificationService authentificationService,
      UserFormService userFormService,
      HttpClient httpClient,
      EventProducerConfig eventProducerConfig,
      ObjectMapper objectMapper) {
    this.authentificationService = authentificationService;
    this.userFormService = userFormService;
    this.httpClient = httpClient;
    this.eventProducerConfig = eventProducerConfig;
    this.objectMapper = objectMapper;
  }

  @GetMapping("/")
  public Page<UserFormDto> list(
      @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
    var currentUserId = authentificationService.getCurrentUserId();
    return userFormService.getAllFormsForCurrentUser(page, size, currentUserId).map(this::toDto);
  }

  @PostMapping("/")
  public ResponseEntity<UserFormDto> create(@RequestBody UserFormDto dto) {
    var currentUserId = authentificationService.getCurrentUserId();

    var created = userFormService.saveForm(toEntity(currentUserId, dto));
    return ResponseEntity.ok(toDto(created));
  }

  @GetMapping("/{id}")
  public ResponseEntity<UserFormDto> detail(@PathVariable String id) {
    var currentUserId = authentificationService.getCurrentUserId();
    return userFormService
        .getDetails(currentUserId, id)
        .map(this::toDto)
        .map(ResponseEntity::ok)
        .orElse(ResponseEntity.notFound().build());
  }

  @PostMapping("/{id}/submit")
  public ResponseEntity<UserFormDto> submit(
      @PathVariable String id, @RequestBody Map<String, Object> dto) {
    var currentUserId = authentificationService.getCurrentUserId();
    dto.put("FORM_ID", id);
    eventProducerRequest(new Event("FORM_SUBMIT", currentUserId, dto));
    return ResponseEntity.ok().build();
  }

  @DeleteMapping("/{id}")
  public ResponseEntity<Void> delete(@PathVariable String id) {
    var currentUserId = authentificationService.getCurrentUserId();
    boolean deleted = userFormService.deleteFormById(currentUserId, id);
    return deleted ? ResponseEntity.noContent().build() : ResponseEntity.status(HttpStatus.NOT_FOUND).build();
  }



  private Form toEntity(String userId, UserFormDto dto) {
    return new Form(null, dto.name(), dto.createdAt(), dto.updatedAt(), dto.fields(), userId);
  }

  private UserFormDto toDto(Form entity) {
    return new UserFormDto(
        entity.id(), entity.name(), entity.createdAt(), entity.updatedAt(), entity.fields());
  }

  private void eventProducerRequest(Event event) {
    try {
      var uri =
          UriComponentsBuilder.newInstance()
              .uri(URI.create(eventProducerConfig.getHost()))
              .pathSegment(eventProducerConfig.getPath())
              .build()
              .toUri();

      var json = objectMapper.writeValueAsString(event);
      final HttpRequest request =
          HttpRequest.newBuilder()
              .POST(HttpRequest.BodyPublishers.ofString(json))
              .uri(uri)
              .header("Content-Type", "application/json")
              .build();

      var response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

      if (response.statusCode() != 200) {
        throw new RuntimeException(
            "An error occurred when trying to submit user form: " + response.body());
      }
    } catch (IOException | InterruptedException e) {
      throw new RuntimeException("Failed to send event: " + e.getMessage(), e);
    }
  }
}
