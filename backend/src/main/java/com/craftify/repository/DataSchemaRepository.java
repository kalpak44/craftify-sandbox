package com.craftify.repository;

import com.craftify.model.DataSchema;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DataSchemaRepository extends MongoRepository<DataSchema, String> {}
