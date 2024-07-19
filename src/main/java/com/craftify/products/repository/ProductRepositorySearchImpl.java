package com.craftify.products.repository;

import com.craftify.products.document.ProductDocument;
import com.craftify.recipes.document.ProductSearch;
import java.util.ArrayList;
import java.util.List;
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

    if (productSearch.getProductName() != null && !productSearch.getProductName().isEmpty()) {
      query.addCriteria(Criteria.where("name").is(productSearch.getProductName()));
    }

    if (productSearch.getAttributes() != null && !productSearch.getAttributes().isEmpty()) {
      var attributeCriteria = new ArrayList<>();
      for (var entry : productSearch.getAttributes().entrySet()) {
        attributeCriteria.add(Criteria.where("attributes." + entry.getKey()).is(entry.getValue()));
      }
      query.addCriteria(new Criteria().andOperator(attributeCriteria.toArray(new Criteria[0])));
    }

    if (productSearch.getMeasurements() != null && !productSearch.getMeasurements().isEmpty()) {
      var measurementCriteria = new ArrayList<>();
      for (var entry : productSearch.getMeasurements().entrySet()) {
        measurementCriteria.add(
            Criteria.where("measurements." + entry.getKey()).is(entry.getValue()));
      }
      query.addCriteria(new Criteria().andOperator(measurementCriteria.toArray(new Criteria[0])));
    }

    if (productSearch.getCategories() != null && !productSearch.getCategories().isEmpty()) {
      var categoryCriteria = new ArrayList<>();
      for (var categorySearch : productSearch.getCategories()) {
        categoryCriteria.add(Criteria.where("categories").is(categorySearch));
      }
      query.addCriteria(new Criteria().andOperator(categoryCriteria.toArray(new Criteria[0])));
    }

    if (productSearch.getTags() != null && !productSearch.getTags().isEmpty()) {
      var tagCriteria = new ArrayList<>();
      for (var entry : productSearch.getTags().entrySet()) {
        tagCriteria.add(Criteria.where("tags." + entry.getKey()).is(entry.getValue()));
      }
      query.addCriteria(new Criteria().andOperator(tagCriteria.toArray(new Criteria[0])));
    }

    return mongoTemplate.find(query, ProductDocument.class);
  }
}
