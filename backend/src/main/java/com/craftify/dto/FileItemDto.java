package com.craftify.dto;

import java.time.Instant;

/**
 * Data Transfer Object representing a file or folder item in the user's storage.
 *
 * @param name the display name of the file or folder
 * @param type the type of the item (e.g. FILE or FOLDER)
 * @param size the size of the file in bytes; for folders, this may be 0 or undefined
 * @param lastModified the timestamp of the last modification
 * @param fullPath the full internal path to the item within the user's namespace
 */
public record FileItemDto(
    String name, FileType type, long size, Instant lastModified, String fullPath) {}
