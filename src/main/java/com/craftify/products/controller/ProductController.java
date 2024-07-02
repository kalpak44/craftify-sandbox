package com.craftify.products.controller;

import com.craftify.products.documents.Product;
import com.craftify.products.service.ProductService;
import com.craftify.shared.controller.capi.CrudController;
import java.util.UUID;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
public class ProductController extends CrudController<Product> {

  public ProductController(ProductService service) {
    super(service);
  }

  @Override
  protected UUID getId(Product entity) {
    return entity.getId();
  }

  @Override
  protected String getEntityName() {
    return Product.class.getSimpleName();
  }
}
