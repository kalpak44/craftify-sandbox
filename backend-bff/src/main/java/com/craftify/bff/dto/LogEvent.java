package com.craftify.bff.dto;

public record LogEvent(String message, String status, String error) {}