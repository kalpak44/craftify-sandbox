package com.craftifycontroller.listener;

import com.craftifycontroller.service.JobLauncherService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.kafka.clients.consumer.ConsumerRecord;
import org.springframework.kafka.annotation.KafkaListener;
import org.springframework.stereotype.Service;
@Service
public class KafkaListenerService {

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
            System.out.println("Received event type: " + type);

            switch (type) {
                case "EVENT_A":
                    jobLauncherService.launchJob("handler-a");
                    break;
                case "EVENT_B":
                    jobLauncherService.launchJob("handler-b");
                    break;
                default:
                    System.out.println("Unknown event type: " + type);
            }

        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
