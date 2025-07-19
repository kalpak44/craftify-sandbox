package com.craftify.producer.controller;

import com.craftify.producer.service.KafkaProducerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.ExampleObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EventProducerController {
  private final KafkaProducerService kafkaProducerService;

  public EventProducerController(KafkaProducerService kafkaProducerService) {
    this.kafkaProducerService = kafkaProducerService;
  }

  @PostMapping
  @Operation(summary = "Produce event", description = "Sends an event JSON to Kafka")
  public ResponseEntity<String> produceEvent(
      @io.swagger.v3.oas.annotations.parameters
              .RequestBody( // Fully qualified name for Swagger annotation
              description = "Example event JSON",
              required = true,
              content =
                  @Content(
                      mediaType = "application/json",
                      examples =
                          @ExampleObject(
                              value =
                                  "{\"type\":\"EVENT_A\",\"payload\":{\"message\":\"Hello world!\"}}")))
          @org.springframework.web.bind.annotation.RequestBody
          String eventJson // Fully qualified name for Spring annotation
      ) {
    kafkaProducerService.sendMessage("event-topic", eventJson);
    return ResponseEntity.ok("Event sent to Kafka");
  }
}
