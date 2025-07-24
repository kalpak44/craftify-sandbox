package com.craftify.bff.controller;

import com.craftify.bff.dto.UserFormDto;
import com.craftify.bff.model.Form;
import com.craftify.bff.service.AuthentificationService;
import com.craftify.bff.service.UserFormService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;


@RestController
@RequestMapping("/forms")
@Tag(name = "User Forms Management", description = "CRUD operations for managing user forms")
public class FormController {
    private final AuthentificationService authentificationService;
    private final UserFormService userFormService;

    public FormController(AuthentificationService authentificationService, UserFormService userFormService) {
        this.authentificationService = authentificationService;
        this.userFormService = userFormService;
    }


    @GetMapping("/")
    public Page<UserFormDto> list(@RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        var currentUserId = authentificationService.getCurrentUserId();
        return userFormService.getAllFormsForCurrentUser(page, size, currentUserId).map(this::toDto);
    }

    private UserFormDto toDto(Form entity) {
        return new UserFormDto(entity.id(), entity.name(), entity.createdAt(), entity.updatedAt());
    }
}
