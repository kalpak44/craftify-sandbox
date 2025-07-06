package com.craftify.controller;

import com.craftify.dto.FileItemDto;
import com.craftify.service.UserStorageService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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
}
