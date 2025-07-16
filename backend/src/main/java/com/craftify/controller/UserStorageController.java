package com.craftify.controller;

import com.craftify.dto.CreateFunctionRequestDto;
import com.craftify.dto.CreateTextFileRequestDto;
import com.craftify.dto.FileItemDto;
import com.craftify.dto.FileTreeNodeDto;
import com.craftify.dto.UpdateTextFileRequestDto;
import com.craftify.service.UserStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Paths;
import java.util.List;

/**
 * REST controller for user-specific file operations on MinIO.
 */
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

    @PostMapping("/create-function")
    @Operation(
            summary = "Create Function",
            description = "Creates a new function folder with a .meta.json file specifying the runtime environment",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CreateFunctionRequestDto.class)
                    )
            )
    )
    @ApiResponse(responseCode = "200", description = "Function creation request accepted")
    public ResponseEntity<Void> createFunction(@RequestBody CreateFunctionRequestDto request) {
        userStorageService.createFunction(request.folder(), request.name(), request.environment());
        return ResponseEntity.ok().build();
    }

    @GetMapping("/tree")
    @Operation(
            summary = "List function file tree",
            description = "Returns root node and full nested structure under given function path (excluding .meta.json)"
    )
    public ResponseEntity<FileTreeNodeDto> getFunctionFileTree(@RequestParam("path") String path) {
        var tree = userStorageService.buildFunctionTree(path);
        return ResponseEntity.ok(tree);
    }


    @GetMapping("/file")
    @Operation(
            summary = "Get file content",
            description = "Returns the raw content of a file under the given path")
    public ResponseEntity<String> getFileContent(@RequestParam("path") String path) {
        try (InputStream stream = userStorageService.downloadUserFile(path)) {
            String content = new String(stream.readAllBytes(), StandardCharsets.UTF_8);
            return ResponseEntity.ok(content);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to read file content: " + e.getMessage());
        }
    }

    @PostMapping("/create-text-file")
    @Operation(
            summary = "Create text file with content",
            description = "Creates a new text file at the given path with the specified content",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = CreateTextFileRequestDto.class)
                    )
            )
    )
    @ApiResponse(responseCode = "200", description = "Text file created successfully")
    public ResponseEntity<String> createTextFile(@RequestBody CreateTextFileRequestDto request) {
        userStorageService.putTextFile(request.path(), request.content());
        return ResponseEntity.ok("Text file created successfully at path: " + request.path());
    }

    @PostMapping("/update-text-file")
    @Operation(
            summary = "Update text file content",
            description = "Updates an existing text file with new content at the specified path",
            requestBody = @io.swagger.v3.oas.annotations.parameters.RequestBody(
                    required = true,
                    content = @Content(
                            mediaType = "application/json",
                            schema = @Schema(implementation = UpdateTextFileRequestDto.class)
                    )
            )
    )
    @ApiResponse(responseCode = "200", description = "Text file updated successfully")
    public ResponseEntity<String> updateTextFile(@RequestBody UpdateTextFileRequestDto request) {
        userStorageService.putTextFile(request.path(), request.content());
        return ResponseEntity.ok("Text file updated successfully at path: " + request.path());
    }

}
