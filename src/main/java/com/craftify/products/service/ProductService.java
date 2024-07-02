package com.craftify.products.service;

import com.craftify.products.documents.Product;
import com.craftify.products.repository.ProductRepository;
import com.craftify.shared.service.capi.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class ProductService extends CrudServiceAbstract<Product> {
  public ProductService(ProductRepository repository) {
    super(repository);
  }
}
