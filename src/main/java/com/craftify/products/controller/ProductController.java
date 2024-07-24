package com.craftify.products.controller;

import com.craftify.products.dto.ProductDto;
import com.craftify.products.dto.ProductSearchFilter;
import com.craftify.products.service.ProductService;
import com.craftify.shared.controller.CrudController;
import com.craftify.shared.service.CurrentUserService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/products")
@Tag(name = "Products")
public class ProductController extends CrudController<ProductDto, String, ProductSearchFilter> {

  public ProductController(ProductService service, CurrentUserService currentUserService) {
    super(service, currentUserService);
  }
}
