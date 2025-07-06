package com.craftify.controller;

import com.craftify.dto.FileItemDto;
import com.craftify.service.UserStorageService;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.nio.file.Paths;
import java.util.List;

/**
 * REST controller for user-specific file operations on MinIO.
 */
@RestController
@RequestMapping("/files")
public class UserStorageController {

    private final UserStorageService userStorageService;

    public UserStorageController(UserStorageService userStorageService) {
        this.userStorageService = userStorageService;
    }

    /**
     * Lists files and folders in a user's specified directory.
     * Example: GET /files/list?folder=subfolder/
     */
    @GetMapping("/list")
    public ResponseEntity<List<FileItemDto>> listUserFiles(@RequestParam(required = false, defaultValue = "") String folder) {
        var files = userStorageService.listUserFolder(folder);
        return ResponseEntity.ok(files);
    }

    /**
     * Creates a new folder at the specified path for the current user.
     * Example: POST /files/mkdir?folder=subfolder/
     */
    @PostMapping("/mkdir")
    public ResponseEntity<String> createFolder(@RequestParam String folder) {
        userStorageService.createUserFolder(folder);
        return ResponseEntity.ok("Folder created successfully: " + folder);
    }

    /**
     * Uploads a file to the authenticated user's specified folder in MinIO.
     * Example: <POST /files/upload</code> with form-data parameters:
     */
    @RequestMapping(
            path = "/upload",
            method = RequestMethod.POST,
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadFile(
            @RequestParam("folder") String folder,
            @RequestPart MultipartFile file) {

        userStorageService.uploadUserFile(folder, file);
        return ResponseEntity.ok("File uploaded successfully: " + file.getOriginalFilename());
    }

    /**
     * Downloads a file for the current user by its full path.
     *
     * @param fullPath the relative or absolute path of the file within the user's namespace.
     * @return a {@link ResponseEntity} containing the file as an attachment if found,
     *         or a 404 response if the file does not exist.
     */
    @GetMapping("/download")
    public ResponseEntity<?> downloadFile(@RequestParam String fullPath) {
        try {
            var fileStream = userStorageService.downloadUserFile(fullPath);
            var resource = new InputStreamResource(fileStream);
            var filename = Paths.get(fullPath).getFileName().toString();

            return ResponseEntity.ok()
                    .header("Content-Disposition", "attachment; filename=\"" + filename + "\"")
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);

        } catch (RuntimeException e) {
            return ResponseEntity
                    .status(404)
                    .body("File not found: " + e.getMessage());
        }
    }

}
