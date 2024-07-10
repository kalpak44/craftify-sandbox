package com.craftify.products.service;

import com.craftify.products.document.ProductDocument;
import com.craftify.products.dto.ProductDto;
import com.craftify.products.repository.ProductRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class ProductService extends CrudServiceAbstract<ProductDocument, ProductDto, String> {

  public ProductService(ProductRepository repository) {
    super(repository);
  }

  @Override
  protected ProductDto toDto(ProductDocument entity) throws ApiException {
    final var productDto = new ProductDto();
    productDto.setId(entity.getId());
    productDto.setName(entity.getName());
    return productDto;
  }

  @Override
  protected ProductDocument toEntity(ProductDto dto) throws ApiException {
    final var product = new ProductDocument();
    product.setId(dto.getId());
    product.setName(dto.getName());

    return product;
  }
}
