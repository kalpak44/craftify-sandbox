package com.craftify.consumer.listener;

import com.craftify.consumer.service.EventTypeRegistry;
import com.craftify.consumer.service.JobLauncherService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.kafka.support.Acknowledgment;
import org.springframework.stereotype.Service;

@Service
public class KafkaListenerService {

  private static final Logger logger = LoggerFactory.getLogger(KafkaListenerService.class);

  private final ObjectMapper objectMapper = new ObjectMapper();
  private final EventTypeRegistry eventTypeRegistry;
  private final JobLauncherService jobLauncherService;

  public KafkaListenerService(
      EventTypeRegistry eventTypeRegistry, JobLauncherService jobLauncherService) {
    this.eventTypeRegistry = eventTypeRegistry;
    this.jobLauncherService = jobLauncherService;
  }

  @KafkaListener(topics = "event-topic", containerFactory = "kafkaManualAckListenerFactory")
  public void listen(ConsumerRecord<String, String> record, Acknowledgment ack) {
    try {
      JsonNode root = objectMapper.readTree(record.value());
      String type = root.path("type").asText();
      JsonNode payloadNode = root.path("payload");
      String payload = payloadNode.isTextual() ? payloadNode.asText() : payloadNode.toString();

      logger.info("Received event type: {}", type);

      if (eventTypeRegistry.isValid(type)) {
        jobLauncherService.launchJob(type, payload);
        ack.acknowledge();
      } else {
        logger.warn("Unknown event type: {} - skipping ack", type);
      }

    } catch (Exception e) {
      logger.error("Error processing Kafka message", e);
    }
  }
}
