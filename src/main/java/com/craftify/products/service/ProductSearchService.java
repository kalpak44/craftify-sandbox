package com.craftify.products.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.dto.ProductSearchFilter;
import com.craftify.products.repository.ProductRepositorySearch;
import com.craftify.recipes.document.ProductSearch;
import java.util.List;
import org.apache.commons.lang3.StringUtils;
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
      ProductSearchFilter productSearchFilter, Pageable pageable, String userId) {
    return productRepositorySearch.searchProducts(
        toProductSearch(productSearchFilter), pageable, userId);
  }

  private ProductSearch toProductSearch(ProductSearchFilter productSearchFilter) {
    var productSearch = new ProductSearch();

    if (StringUtils.isNotBlank(productSearchFilter.getId())) {
      productSearch.setId(productSearchFilter.getId());
    }
    if (StringUtils.isNotBlank(productSearchFilter.getName())) {
      productSearch.setProductName(productSearchFilter.getName());
    }
    if (productSearchFilter.getAttributes() != null
        && !productSearchFilter.getAttributes().isEmpty()) {
      productSearch.setAttributes(productSearchFilter.getAttributes());
    }
    if (productSearchFilter.getTags() != null && !productSearchFilter.getTags().isEmpty()) {
      productSearch.setTags(productSearchFilter.getTags());
    }
    if (productSearchFilter.getCategories() != null
        && !productSearchFilter.getCategories().isEmpty()) {
      productSearch.setCategories(productSearchFilter.getCategories());
    }

    return productSearch;
  }
}
