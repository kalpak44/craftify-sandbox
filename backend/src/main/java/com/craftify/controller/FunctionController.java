// New REST Controller
package com.craftify.controller;

import com.craftify.dto.CreateFunctionRequestDto;
import com.craftify.dto.FileTreeNodeDto;
import com.craftify.service.UserStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@RestController
@RequestMapping("/functions")
@Tag(name = "Function Management", description = "Create and manage user-defined functions")
public class FunctionController {

    private final UserStorageService userStorageService;

    public FunctionController(UserStorageService userStorageService) {
        this.userStorageService = userStorageService;
    }

    @PostMapping("/create")
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

}
