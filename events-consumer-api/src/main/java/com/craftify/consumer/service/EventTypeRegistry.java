package com.craftify.consumer.service;

import org.springframework.stereotype.Component;

@Component
public class EventTypeRegistry {

  public boolean isValid(String type) {
    return "FORM_SUBMIT".equals(type);
  }

  public String executionLogic(String type, String payload) {
    if ("FORM_SUBMIT".equals(type)) {
      return "curl -X POST https://kalpak44.free.beeceptor.com -d \"payload="
          + payload.replace("\"", "\\\"")
          + "\"";
    }
    return "echo \"Unknown event type\"";
  }
}
