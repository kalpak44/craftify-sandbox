package com.craftify.dto;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(description = "Tree node representing a file or folder")
public record FileTreeNodeDto(
        @Schema(description = "Name of the file or folder") String name,
        @Schema(description = "Full relative path from root") String fullPath,
        @Schema(description = "File type (FILE, FOLDER)") FileType type,
        @Schema(description = "Size in bytes (only for files)") long size,
        @Schema(description = "Last modified timestamp") Instant lastModified,
        @Schema(description = "Children (only for folders)") List<FileTreeNodeDto> children
) {
}
