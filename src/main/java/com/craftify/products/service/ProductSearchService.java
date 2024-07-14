package com.craftify.products.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.repository.ProductRepositorySearch;
import com.craftify.recipes.document.ProductSearch;
import java.util.List;
import org.springframework.stereotype.Service;

@Service
public class ProductSearchService {

  private final ProductRepositorySearch productRepositorySearch;

  public ProductSearchService(ProductRepositorySearch productRepositorySearch) {
    this.productRepositorySearch = productRepositorySearch;
  }

  public List<ProductDocument> searchProducts(ProductSearch productSearch) {
    return productRepositorySearch.searchProducts(productSearch);
  }
}
