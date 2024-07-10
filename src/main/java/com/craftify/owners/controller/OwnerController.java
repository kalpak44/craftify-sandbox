package com.craftify.owners.controller;

import com.craftify.owners.dto.OwnerDto;
import com.craftify.owners.service.OwnerService;
import com.craftify.shared.controller.CrudController;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/owners")
@Tag(name = "Owners")
public class OwnerController extends CrudController<OwnerDto, String> {
  public OwnerController(OwnerService service) {
    super(service);
  }
}
