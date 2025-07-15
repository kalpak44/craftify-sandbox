// New REST Controller
package com.craftify.controller;

import com.craftify.dto.CreateFunctionRequestDto;
import com.craftify.service.UserStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

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
    @ApiResponse(responseCode = "202", description = "Function creation request accepted")
    public ResponseEntity<Void> createFunction(@RequestBody CreateFunctionRequestDto request) {
        userStorageService.createFunction(request.folder(), request.name(), request.environment());
        return ResponseEntity.ok().build();
    }
}
