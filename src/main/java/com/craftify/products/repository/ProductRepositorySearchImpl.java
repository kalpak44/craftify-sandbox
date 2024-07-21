package com.craftify.products.repository;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.document.ProductSearch;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.data.mongodb.core.query.Criteria;
import org.springframework.data.mongodb.core.query.Query;
import org.springframework.stereotype.Repository;

@Repository
public class ProductRepositorySearchImpl implements ProductRepositorySearch {
  private final MongoTemplate mongoTemplate;

  public ProductRepositorySearchImpl(MongoTemplate mongoTemplate) {
    this.mongoTemplate = mongoTemplate;
  }

  @Override
  public List<ProductDocument> searchProducts(ProductSearch productSearch) {
    var query = new Query();
    addProductNameCriteria(query, productSearch.getProductName());
    addAttributesCriteria(query, productSearch.getAttributes());
    addMeasurementsCriteria(query, productSearch.getMeasurements());
    addCategoriesCriteria(query, productSearch.getCategories());
    addTagsCriteria(query, productSearch.getTags());
    return mongoTemplate.find(query, ProductDocument.class);
  }

  @Override
  public Page<ProductDocument> searchProducts(ProductSearch productSearch, Pageable pageable) {
    var query = new Query();
    addProductNameCriteria(query, productSearch.getProductName());
    addAttributesCriteria(query, productSearch.getAttributes());
    addMeasurementsCriteria(query, productSearch.getMeasurements());
    addCategoriesCriteria(query, productSearch.getCategories());
    addTagsCriteria(query, productSearch.getTags());
    return executePagedQuery(query, pageable);
  }

  @Override
  public List<ProductDocument> searchByCategories(Set<String> categories) {
    var query = new Query();
    addCategoriesCriteria(query, categories);
    return mongoTemplate.find(query, ProductDocument.class);
  }

  @Override
  public Page<ProductDocument> searchByCategories(Set<String> categories, Pageable pageable) {
    var query = new Query();
    addCategoriesCriteria(query, categories);
    return executePagedQuery(query, pageable);
  }

  @Override
  public List<ProductDocument> searchByAttributes(Map<String, String> attributes) {
    var query = new Query();
    addAttributesCriteria(query, attributes);
    return mongoTemplate.find(query, ProductDocument.class);
  }

  @Override
  public Page<ProductDocument> searchByAttributes(
      Map<String, String> attributes, Pageable pageable) {
    var query = new Query();
    addAttributesCriteria(query, attributes);
    return executePagedQuery(query, pageable);
  }

  @Override
  public List<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements) {
    var query = new Query();
    addMeasurementsCriteria(query, measurements);
    return mongoTemplate.find(query, ProductDocument.class);
  }

  @Override
  public Page<ProductDocument> searchByMeasurements(
      Map<String, Map<BigDecimal, String>> measurements, Pageable pageable) {
    var query = new Query();
    addMeasurementsCriteria(query, measurements);
    return executePagedQuery(query, pageable);
  }

  @Override
  public List<ProductDocument> searchByTags(Map<String, String> tags) {
    var query = new Query();
    addTagsCriteria(query, tags);
    return mongoTemplate.find(query, ProductDocument.class);
  }

  @Override
  public Page<ProductDocument> searchByTags(Map<String, String> tags, Pageable pageable) {
    var query = new Query();
    addTagsCriteria(query, tags);
    return executePagedQuery(query, pageable);
  }

  private void addProductNameCriteria(Query query, String productName) {
    if (productName != null && !productName.isEmpty()) {
      query.addCriteria(Criteria.where("name").is(productName));
    }
  }

  private void addAttributesCriteria(Query query, Map<String, String> attributes) {
    if (attributes != null && !attributes.isEmpty()) {
      var attributeCriteria = new ArrayList<>();
      for (var entry : attributes.entrySet()) {
        attributeCriteria.add(Criteria.where("attributes." + entry.getKey()).is(entry.getValue()));
      }
      query.addCriteria(new Criteria().andOperator(attributeCriteria.toArray(new Criteria[0])));
    }
  }

  private void addMeasurementsCriteria(
      Query query, Map<String, Map<BigDecimal, String>> measurements) {
    if (measurements != null && !measurements.isEmpty()) {
      var measurementCriteria = new ArrayList<>();
      for (var entry : measurements.entrySet()) {
        measurementCriteria.add(
            Criteria.where("measurements." + entry.getKey()).is(entry.getValue()));
      }
      query.addCriteria(new Criteria().andOperator(measurementCriteria.toArray(new Criteria[0])));
    }
  }

  private void addCategoriesCriteria(Query query, Set<String> categories) {
    if (categories != null && !categories.isEmpty()) {
      var categoryCriteria = new ArrayList<>();
      for (var category : categories) {
        categoryCriteria.add(Criteria.where("categories").is(category));
      }
      query.addCriteria(new Criteria().andOperator(categoryCriteria.toArray(new Criteria[0])));
    }
  }

  private void addTagsCriteria(Query query, Map<String, String> tags) {
    if (tags != null && !tags.isEmpty()) {
      var tagCriteria = new ArrayList<>();
      for (var entry : tags.entrySet()) {
        tagCriteria.add(Criteria.where("tags." + entry.getKey()).is(entry.getValue()));
      }
      query.addCriteria(new Criteria().andOperator(tagCriteria.toArray(new Criteria[0])));
    }
  }

  private Page<ProductDocument> executePagedQuery(Query query, Pageable pageable) {
    long total = mongoTemplate.count(query, ProductDocument.class);
    var documents = mongoTemplate.find(query.with(pageable), ProductDocument.class);
    return new PageImpl<>(documents, pageable, total);
  }
}
