package com.craftify.bff.dto;

/**
 * Enum representing the type of item in user storage. It can either be a regular file,
 * a folder/directory, or a function folder.
 */
public enum FileType {

  /** Represents a file. */
  FILE,

  /** Represents a folder or directory. */
  FOLDER,

  /** Represents a function folder (contains .meta.json). */
  FUNCTION
}