package com.craftify.products.repository;

import com.craftify.products.document.ProductDocument;
import com.craftify.shared.repository.UserDataRepository;

public interface ProductRepository extends UserDataRepository<ProductDocument, String> {}
