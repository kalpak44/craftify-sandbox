package com.craftify.dto;

import java.util.Map;

/** DTO representing a single data record */
public record RecordDto(String id, Map<String, Object> data) {}
