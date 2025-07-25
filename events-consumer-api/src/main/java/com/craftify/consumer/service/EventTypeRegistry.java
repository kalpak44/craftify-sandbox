package com.craftify.consumer.service;

import org.springframework.stereotype.Component;

import java.util.Set;

@Component
public class EventTypeRegistry {
    private final Set<String> validEventTypes = Set.of("EVENT_A", "EVENT_B", "FORM_SUBMIT");

    public boolean isValid(String type) {
        return validEventTypes.contains(type);
    }
}

