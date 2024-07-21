package com.craftify.products.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.dto.ProductDto;
import com.craftify.products.dto.ProductSearchFilter;
import com.craftify.products.repository.ProductRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import java.util.Set;
import org.apache.commons.lang3.StringUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProductService
    extends CrudServiceAbstract<ProductDocument, ProductDto, String, ProductSearchFilter> {
  private final ProductSearchService productSearchService;

  public ProductService(ProductRepository repository, ProductSearchService productSearchService) {
    super(repository);
    this.productSearchService = productSearchService;
  }

  @Override
  public Page<ProductDto> findAll(Pageable pageable, ProductSearchFilter searchFilter) {
    if (searchFilter != null && StringUtils.isNotBlank(searchFilter.getCategory())) {
      return productSearchService
          .searchByCategories(Set.of(searchFilter.getCategory()), pageable)
          .map(this::toDto);
    }
    return super.findAll(pageable, searchFilter);
  }

  @Override
  protected ProductDto toDto(ProductDocument entity) throws ApiException {
    validateProduct(entity);
    final var productDto = new ProductDto();
    productDto.setId(entity.getId());
    productDto.setName(entity.getName());
    productDto.setAttributes(entity.getAttributes());
    productDto.setMeasurements(entity.getMeasurements());
    productDto.setAvailability(entity.getAvailability());
    productDto.setCategories(entity.getCategories());
    productDto.setTags(entity.getTags());
    return productDto;
  }

  @Override
  protected ProductDocument toEntity(ProductDto dto) throws ApiException {
    validateProductDto(dto);
    final var product = new ProductDocument();
    product.setId(dto.getId());
    product.setName(dto.getName());
    product.setAttributes(dto.getAttributes());
    product.setMeasurements(dto.getMeasurements());
    product.setAvailability(
        dto.getAvailability() == null || dto.getAvailability().isEmpty()
            ? dto.getMeasurements()
            : dto.getAvailability());
    product.setAvailability(dto.getMeasurements());

    product.setCategories(dto.getCategories());
    product.setTags(dto.getTags());
    return product;
  }

  private void validateProduct(ProductDocument product) {
    if (StringUtils.isEmpty(product.getName())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "ProductDocument must contain a name");
    }
  }

  private void validateProductDto(ProductDto productDto) {
    if (StringUtils.isEmpty(productDto.getName())) {
      throw new ApiException(HttpStatus.BAD_REQUEST, "ProductDto must contain a name");
    }
  }
}
