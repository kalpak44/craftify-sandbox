package com.craftify.notebooks.controller;

import com.craftify.notebooks.dto.NotebookDto;
import com.craftify.notebooks.service.NotebooksService;
import com.craftify.recipes.dto.RecipeDto;
import com.craftify.shared.controller.CrudController;
import com.craftify.shared.dto.SearchFilter;
import com.craftify.shared.service.CrudService;
import com.craftify.shared.service.CurrentUserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notebooks")
@Tag(name = "Notebooks")
public class NotebookController extends CrudController<NotebookDto, String, SearchFilter> {
    protected NotebookController(NotebooksService service, CurrentUserService currentUserService) {
        super(service, currentUserService);
    }
}
