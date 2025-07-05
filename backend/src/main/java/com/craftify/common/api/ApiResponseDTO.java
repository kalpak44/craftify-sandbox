package com.craftify.common.api;

import java.time.Instant;

/**
 * Data Transfer Object for API responses.
 * Contains a timestamp and a descriptive message.
 *
 * @param datetime the timestamp of the response
 * @param message  the message to be conveyed (e.g. error or status)
 */
public record ApiResponseDTO(Instant datetime, String message) {
}
