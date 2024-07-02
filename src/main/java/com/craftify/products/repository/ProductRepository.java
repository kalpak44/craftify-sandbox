package com.craftify.products.repository;

import com.craftify.products.documents.Product;
import java.util.UUID;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface ProductRepository extends MongoRepository<Product, UUID> {}
