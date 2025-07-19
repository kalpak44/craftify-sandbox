package com.craftify.consumer.listener;

import com.craftify.consumer.service.JobLauncherService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;

@Service
public class KafkaListenerService {

  private static final Logger logger = LoggerFactory.getLogger(KafkaListenerService.class);

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final JobLauncherService jobLauncherService;

  public KafkaListenerService(JobLauncherService jobLauncherService) {
    this.jobLauncherService = jobLauncherService;
  }

  @KafkaListener(topics = "event-topic")
  public void listen(ConsumerRecord<String, String> record) {
    try {
      JsonNode root = objectMapper.readTree(record.value());
      String type = root.path("type").asText();
      logger.info("Received event type: {}", type);

      switch (type) {
        case "EVENT_A" -> jobLauncherService.launchJob("handler-a");
        case "EVENT_B" -> jobLauncherService.launchJob("handler-b");
        default -> logger.warn("Unknown event type: {}", type);
      }

    } catch (Exception e) {
      logger.error("Error processing Kafka message", e);
    }
  }
}
