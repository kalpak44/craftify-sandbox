package com.craftify.products.repository;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.document.ProductSearch;
import java.util.List;

public interface ProductRepositorySearch {
  List<ProductDocument> searchProducts(ProductSearch productSearch);
}
