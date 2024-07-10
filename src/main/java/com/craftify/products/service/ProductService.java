package com.craftify.products.service;

import com.craftify.owners.repository.OwnerRepository;
import com.craftify.products.documents.Product;
import com.craftify.products.dto.ProductDto;
import com.craftify.products.repository.ProductRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;

@Service
public class ProductService extends CrudServiceAbstract<Product, ProductDto, String> {
  private final OwnerRepository ownerRepository;

  public ProductService(ProductRepository repository, OwnerRepository ownerRepository) {
    super(repository);
    this.ownerRepository = ownerRepository;
  }

  @Override
  protected ProductDto toDto(Product entity) throws ApiException {
    final var ownerId = entity.getOwner() != null ? entity.getOwner().getId() : null;
    final var productDto = new ProductDto();
    productDto.setId(entity.getId());
    productDto.setName(entity.getName());
    productDto.setOwnerId(ownerId);
    return productDto;
  }

  @Override
  protected Product toEntity(ProductDto dto) throws ApiException {
    final var product = new Product();
    product.setId(dto.getId());
    product.setName(dto.getName());

    if (dto.getOwnerId() != null) {
      final var ownerEntityOptional = ownerRepository.findById(dto.getOwnerId());
      if (ownerEntityOptional.isPresent()) {
        product.setOwner(ownerEntityOptional.get());
      } else {
        throw new ApiException(
            HttpStatus.BAD_REQUEST, "Owner with ID \"" + dto.getOwnerId() + "\" not found.");
      }
    } else {
      throw new ApiException(HttpStatus.BAD_REQUEST, "Owner ID is required.");
    }

    return product;
  }
}
