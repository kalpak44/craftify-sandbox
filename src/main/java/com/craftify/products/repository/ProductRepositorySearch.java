package com.craftify.products.repository;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.document.ProductSearch;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ProductRepositorySearch {
  List<ProductDocument> searchProducts(ProductSearch productSearch);

  Page<ProductDocument> searchProducts(ProductSearch productSearch, Pageable pageable);

  List<ProductDocument> searchByCategories(Set<String> categories);

  Page<ProductDocument> searchByCategories(Set<String> categories, Pageable pageable);

  List<ProductDocument> searchByAttributes(Map<String, String> attributes);

  Page<ProductDocument> searchByAttributes(Map<String, String> attributes, Pageable pageable);

  List<ProductDocument> searchByMeasurements(Map<String, Map<BigDecimal, String>> measurements);

  Page<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, Pageable pageable);

  List<ProductDocument> searchByTags(Map<String, String> tags);

  Page<ProductDocument> searchByTags(Map<String, String> tags, Pageable pageable);
}
