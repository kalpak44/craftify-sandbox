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
  List<ProductDocument> searchProducts(ProductSearch productSearch, String userId);

  Page<ProductDocument> searchProducts(
      ProductSearch productSearch, Pageable pageable, String userId);

  List<ProductDocument> searchByCategories(Set<String> categories, String userId);

  Page<ProductDocument> searchByCategories(
      Set<String> categories, Pageable pageable, String userId);

  List<ProductDocument> searchByAttributes(Map<String, String> attributes, String userId);

  Page<ProductDocument> searchByAttributes(
      Map<String, String> attributes, Pageable pageable, String userId);

  List<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, String userId);

  Page<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, Pageable pageable, String userId);

  List<ProductDocument> searchByTags(Map<String, String> tags, String userId);

  Page<ProductDocument> searchByTags(Map<String, String> tags, Pageable pageable, String userId);
}
