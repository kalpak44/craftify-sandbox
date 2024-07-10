package com.craftify.products.controller;

import com.craftify.products.dto.ProductDto;
import com.craftify.products.service.ProductService;
import com.craftify.shared.controller.CrudController;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
public class ProductController extends CrudController<ProductDto, String> {

  public ProductController(ProductService service) {
    super(service);
  }
}
