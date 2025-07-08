package com.craftify.service;

import com.craftify.model.DataSchema;
import com.craftify.repository.DataSchemaRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/** Service layer for managing DataSchema entities. */
@Service
public class DataSchemaService {

  private final DataSchemaRepository repository;

  /**
   * Constructs a new DataSchemaService with the provided repository.
   *
   * @param repository the repository used for DataSchema persistence
   */
  public DataSchemaService(DataSchemaRepository repository) {
    this.repository = repository;
  }

  /**
   * Creates and saves a new DataSchema.
   *
   * @param schema the schema to create
   * @return the saved DataSchema
   */
  public DataSchema create(DataSchema schema) {
    return repository.save(schema);
  }

  /**
   * Retrieves a paginated list of DataSchemas sorted by name.
   *
   * @param page the page number to retrieve
   * @param size the number of items per page
   * @return a page of DataSchema entities
   */
  public Page<DataSchema> list(int page, int size) {
    var pageable = PageRequest.of(page, size);
    return repository.findAll(pageable);
  }

  /**
   * Retrieves a DataSchema by its ID.
   *
   * @param id the ID of the schema
   * @return an Optional containing the DataSchema if found
   */
  public Optional<DataSchema> getById(String id) {
    return repository.findById(id);
  }

  /**
   * Updates an existing DataSchema with new values.
   *
   * @param id the ID of the existing DataSchema
   * @param updatedSchema the new schema data
   * @return an Optional containing the updated schema if the original was found
   */
  public Optional<DataSchema> update(String id, DataSchema updatedSchema) {

    return repository
        .findById(id)
        .map(
            existing -> {
              var updated =
                  new DataSchema(
                      existing.id(),
                      updatedSchema.name(),
                      updatedSchema.description(),
                      updatedSchema.schema());
              return repository.save(updated);
            });
  }

  /**
   * Checks whether a schema can be safely deleted. For now, always returns true (placeholder).
   *
   * @param id the ID of the schema
   * @return true if it can be deleted
   */
  public boolean canDelete(String id) {
    // TODO: Replace with actual logic for checking record references
    return true;
  }

  /**
   * Checks whether a schema can be updated. For now, always returns true (placeholder).
   *
   * @param id the ID of the schema
   * @return true if the schema is allowed to be updated
   */
  public boolean canUpdate(String id) {
    // TODO: Add logic for locking immutable schemas
    return true;
  }

  /**
   * Deletes a DataSchema by ID.
   *
   * @param id the ID of the schema to delete
   */
  public void delete(String id) {
    repository.deleteById(id);
  }
}
