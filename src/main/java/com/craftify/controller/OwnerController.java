package com.craftify.controller;

import com.craftify.controller.api.CrudController;
import com.craftify.documents.Owner;
import com.craftify.service.OwnerService;
import java.util.UUID;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/owners")
public class OwnerController extends CrudController<Owner> {

  public OwnerController(OwnerService service) {
    super(service);
  }

  @Override
  protected UUID getId(Owner entity) {
    return entity.getId();
  }

  @Override
  protected String getEntityName() {
    return Owner.class.getSimpleName();
  }
}
