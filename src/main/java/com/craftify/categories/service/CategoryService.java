package com.craftify.categories.service;

import com.craftify.categories.document.CategoryDocument;
import com.craftify.categories.dto.CategoryDto;
import com.craftify.categories.repository.CategoryRepository;
import com.craftify.shared.exception.ApiException;
import com.craftify.shared.service.CrudServiceAbstract;
import org.springframework.stereotype.Service;

@Service
public class CategoryService extends CrudServiceAbstract<CategoryDocument, CategoryDto, String> {
  public CategoryService(CategoryRepository repository) {
    super(repository);
  }

  @Override
  protected CategoryDto toDto(CategoryDocument categoryDocument) throws ApiException {
    final var categoryDto = new CategoryDto();
    categoryDto.setId(categoryDocument.getId());
    categoryDto.setName(categoryDocument.getName());
    return categoryDto;
  }

  @Override
  protected CategoryDocument toEntity(CategoryDto dto) throws ApiException {
    final var categoryDocument = new CategoryDocument();
    categoryDocument.setId(dto.getId());
    categoryDocument.setName(dto.getName());
    return categoryDocument;
  }
}
