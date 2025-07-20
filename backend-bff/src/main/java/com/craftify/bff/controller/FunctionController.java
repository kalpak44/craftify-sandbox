package com.craftify.bff.controller;

import com.craftify.bff.dto.FunctionDto;
import com.craftify.bff.service.FunctionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/function")
@Tag(
        name = "Function",
        description = "Operations for function registration"
)
public class FunctionController {

    private final FunctionService functionService;

    @Autowired
    public FunctionController(FunctionService functionService) {
        this.functionService = functionService;
    }

    @GetMapping("/list")
    public Page<FunctionDto> list(Pageable pageable) {
        return functionService.getAllFunctionsForCurrentUser(pageable);
    }
}
