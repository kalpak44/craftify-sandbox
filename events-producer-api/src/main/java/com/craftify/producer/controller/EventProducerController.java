package com.craftify.producer.controller;

import com.craftify.producer.service.KafkaProducerService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class EventProducerController {
    private final KafkaProducerService kafkaProducerService;

    public EventProducerController(KafkaProducerService kafkaProducerService) {
        this.kafkaProducerService = kafkaProducerService;
    }

    @PostMapping
    public ResponseEntity<String> produceEvent(@RequestBody String eventJson) {
        kafkaProducerService.sendMessage("event-topic", eventJson);
        return ResponseEntity.ok("Event sent to Kafka");
    }
}
