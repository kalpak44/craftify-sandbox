package com.craftify.products.repository;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.document.ProductSearch;
import java.util.List;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductRepositorySearch {
  List<ProductDocument> searchProducts(ProductSearch productSearch, String userId);

  Page<ProductDocument> searchProducts(
      ProductSearch productSearch, Pageable pageable, String userId);
}
