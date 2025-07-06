package com.craftify.controller;

import com.craftify.dto.FileItemDto;
import com.craftify.service.UserStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import java.nio.file.Paths;
import java.util.List;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

/** REST controller for user-specific file operations on MinIO. */
@RestController
@RequestMapping("/files")
@Tag(
    name = "User File Storage",
    description = "Operations for managing user-specific files and folders in MinIO")
public class UserStorageController {

  private final UserStorageService userStorageService;

  public UserStorageController(UserStorageService userStorageService) {
    this.userStorageService = userStorageService;
  }

  @Operation(
      summary = "List user files",
      description = "Lists files and folders in a user's specified directory")
  @ApiResponse(
      responseCode = "200",
      description = "List of files",
      content =
          @Content(
              mediaType = "application/json",
              schema = @Schema(implementation = FileItemDto.class)))
  @GetMapping("/list")
  public ResponseEntity<List<FileItemDto>> listUserFiles(
      @Parameter(description = "Folder path relative to user root", example = "subfolder/")
          @RequestParam(required = false, defaultValue = "")
          String folder) {
    var files = userStorageService.listUserFolder(folder);
    return ResponseEntity.ok(files);
  }

  @Operation(
      summary = "Create folder",
      description = "Creates a new folder for the user in the specified path")
  @ApiResponse(responseCode = "200", description = "Folder created successfully")
  @PostMapping("/mkdir")
  public ResponseEntity<String> createFolder(
      @Parameter(description = "Name or path of the folder to create", required = true)
          @RequestParam
          String folder) {
    userStorageService.createUserFolder(folder);
    return ResponseEntity.ok("Folder created successfully: " + folder);
  }

  @Operation(
      summary = "Upload file",
      description = "Uploads a file to the authenticated user's folder")
  @ApiResponses({
    @ApiResponse(responseCode = "200", description = "File uploaded successfully"),
    @ApiResponse(responseCode = "400", description = "Invalid input", content = @Content)
  })
  @RequestMapping(
      path = "/upload",
      method = RequestMethod.POST,
      consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
  public ResponseEntity<String> uploadFile(
      @Parameter(description = "Target folder path", required = true) @RequestParam("folder")
          String folder,
      @Parameter(
              description = "File to upload",
              required = true,
              content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE))
          @RequestPart
          MultipartFile file) {

    userStorageService.uploadUserFile(folder, file);
    return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
  }

  @Operation(summary = "Download file", description = "Downloads a file by its full path")
  @ApiResponses({
    @ApiResponse(
        responseCode = "200",
        description = "File returned as attachment",
        content = @Content(mediaType = MediaType.APPLICATION_OCTET_STREAM_VALUE)),
    @ApiResponse(responseCode = "404", description = "File not found")
  })
  @GetMapping("/download")
  public ResponseEntity<?> downloadFile(
      @Parameter(description = "Full file path", required = true) @RequestParam String fullPath) {
    try {
      var fileStream = userStorageService.downloadUserFile(fullPath);
      var resource = new InputStreamResource(fileStream);
      var filename = Paths.get(fullPath).getFileName().toString();

      return ResponseEntity.ok()
          .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
          .contentType(MediaType.APPLICATION_OCTET_STREAM)
          .body(resource);

    } catch (RuntimeException e) {
      return ResponseEntity.status(404).body("File not found: " + e.getMessage());
    }
  }

  @Operation(
      summary = "Delete file or folder",
      description = "Deletes a file or folder for the user")
  @ApiResponse(responseCode = "200", description = "Deleted successfully")
  @DeleteMapping("/delete")
  public ResponseEntity<String> deletePath(
      @Parameter(description = "Path of file or folder to delete", required = true) @RequestParam
          String path) {
    userStorageService.deleteUserPath(path);
    return ResponseEntity.ok("Deleted successfully: " + path);
  }

  @Operation(
      summary = "Move or rename file/folder",
      description = "Moves or renames a file or folder for the user")
  @ApiResponse(responseCode = "200", description = "Moved successfully")
  @PostMapping("/move")
  public ResponseEntity<String> movePath(
      @Parameter(description = "Source path", required = true) @RequestParam String fromPath,
      @Parameter(description = "Target path", required = true) @RequestParam String toPath) {
    userStorageService.moveUserPath(fromPath, toPath);
    return ResponseEntity.ok("Moved successfully from " + fromPath + " to " + toPath);
  }
}
