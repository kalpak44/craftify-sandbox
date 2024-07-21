package com.craftify.products.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.repository.ProductRepositorySearch;
import com.craftify.recipes.document.ProductSearch;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
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

  public Page<ProductDocument> searchProducts(ProductSearch productSearch, Pageable pageable) {
    return productRepositorySearch.searchProducts(productSearch, pageable);
  }

  public List<ProductDocument> searchByCategories(Set<String> categories) {
    return productRepositorySearch.searchByCategories(categories);
  }

  public Page<ProductDocument> searchByCategories(Set<String> categories, Pageable pageable) {
    return productRepositorySearch.searchByCategories(categories, pageable);
  }

  public List<ProductDocument> searchByAttributes(Map<String, String> attributes) {
    return productRepositorySearch.searchByAttributes(attributes);
  }

  public Page<ProductDocument> searchByAttributes(
      Map<String, String> attributes, Pageable pageable) {
    return productRepositorySearch.searchByAttributes(attributes, pageable);
  }

  public List<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements) {
    return productRepositorySearch.searchByMeasurements(measurements);
  }

  public Page<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, Pageable pageable) {
    return productRepositorySearch.searchByMeasurements(measurements, pageable);
  }

  public List<ProductDocument> searchByTags(Map<String, String> tags) {
    return productRepositorySearch.searchByTags(tags);
  }

  public Page<ProductDocument> searchByTags(Map<String, String> tags, Pageable pageable) {
    return productRepositorySearch.searchByTags(tags, pageable);
  }
}
