package com.craftify.bff.model;

import java.util.Map;

public record Event(String type, String userId, Map<String, Object> payload) {}
