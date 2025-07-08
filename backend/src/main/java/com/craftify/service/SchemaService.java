package com.craftify.service;

import com.craftify.model.Schema;
import com.craftify.repository.SchemaRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/** Service layer for managing DataSchema entities. */
@Service
public class SchemaService {

  private final SchemaRepository repository;
  private final AuthentificationService auth;

  /**
   * Constructs a new DataSchemaService with the provided repository.
   *
   * @param repository the repository used for DataSchema persistence
   */
  public SchemaService(SchemaRepository repository, AuthentificationService auth) {
    this.repository = repository;
    this.auth = auth;
  }

  /**
   * Creates and saves a new DataSchema.
   *
   * @param schema the schema to create
   * @return the saved DataSchema
   */
  public Schema create(Schema schema) {
    return repository.save(
        new Schema(
            schema.id(),
            schema.name(),
            schema.description(),
            schema.schema(),
            auth.getCurrentUserId()));
  }

  /**
   * Retrieves a paginated list of DataSchemas sorted by name.
   *
   * @param page the page number to retrieve
   * @param size the number of items per page
   * @return a page of DataSchema entities
   */
  public Page<Schema> list(int page, int size) {
    return repository.findAllByUserId(auth.getCurrentUserId(), PageRequest.of(page, size));
  }

  /**
   * Retrieves a DataSchema by its ID.
   *
   * @param id the ID of the schema
   * @return an Optional containing the DataSchema if found
   */
  public Optional<Schema> getById(String id) {
    return repository.findByIdAndUserId(id, auth.getCurrentUserId());
  }

  /**
   * Updates an existing DataSchema with new values.
   *
   * @param id the ID of the existing DataSchema
   * @param updatedSchema the new schema data
   * @return an Optional containing the updated schema if the original was found
   */
  public Optional<Schema> update(String id, Schema updatedSchema) {
    return repository
        .findByIdAndUserId(id, auth.getCurrentUserId())
        .map(
            existing ->
                repository.save(
                    new Schema(
                        existing.id(),
                        updatedSchema.name(),
                        updatedSchema.description(),
                        updatedSchema.schema(),
                        existing.userId())));
  }

  /**
   * Deletes a DataSchema by ID.
   *
   * @param id the ID of the schema to delete
   */
  public void delete(String id) {
    repository
        .findByIdAndUserId(id, auth.getCurrentUserId())
        .ifPresent(schema -> repository.deleteById(schema.id()));
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
}
