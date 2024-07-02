package com.craftify.owners.controller;

import com.craftify.owners.documents.Owner;
import com.craftify.owners.service.OwnerService;
import com.craftify.shared.controller.capi.CrudController;
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
