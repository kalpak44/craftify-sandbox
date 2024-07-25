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

  public List<ProductDocument> searchProducts(ProductSearch productSearch, String userId) {
    return productRepositorySearch.searchProducts(productSearch, userId);
  }

  public Page<ProductDocument> searchProducts(
      ProductSearch productSearch, Pageable pageable, String userId) {
    return productRepositorySearch.searchProducts(productSearch, pageable, userId);
  }

  public List<ProductDocument> searchByCategories(Set<String> categories, String userId) {
    return productRepositorySearch.searchByCategories(categories, userId);
  }

  public Page<ProductDocument> searchByCategories(
      Set<String> categories, Pageable pageable, String userId) {
    return productRepositorySearch.searchByCategories(categories, pageable, userId);
  }

  public List<ProductDocument> searchByAttributes(Map<String, String> attributes, String userId) {
    return productRepositorySearch.searchByAttributes(attributes, userId);
  }

  public Page<ProductDocument> searchByAttributes(
      Map<String, String> attributes, Pageable pageable, String userId) {
    return productRepositorySearch.searchByAttributes(attributes, pageable, userId);
  }

  public List<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, String userId) {
    return productRepositorySearch.searchByMeasurements(measurements, userId);
  }

  public Page<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, Pageable pageable, String userId) {
    return productRepositorySearch.searchByMeasurements(measurements, pageable, userId);
  }

  public List<ProductDocument> searchByTags(Map<String, String> tags, String userId) {
    return productRepositorySearch.searchByTags(tags, userId);
  }

  public Page<ProductDocument> searchByTags(
      Map<String, String> tags, Pageable pageable, String userId) {
    return productRepositorySearch.searchByTags(tags, pageable, userId);
  }
}
