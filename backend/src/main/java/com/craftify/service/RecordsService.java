package com.craftify.service;

import com.craftify.model.Record;
import com.craftify.repository.RecordsRepository;
import com.craftify.repository.SchemaRepository;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

/** Service layer for managing schema-bound record data. */
@Service
public class RecordsService {

  private final RecordsRepository repository;
  private final SchemaRepository schemaRepository;
  private final AuthentificationService auth;

  /**
   * Constructs a new RecordsService with required dependencies.
   *
   * @param repository the data repository for record storage
   * @param schemaRepository the repository for schema metadata
   * @param auth authentication service for user context
   */
  public RecordsService(
      RecordsRepository repository,
      SchemaRepository schemaRepository,
      AuthentificationService auth) {
    this.repository = repository;
    this.schemaRepository = schemaRepository;
    this.auth = auth;
  }

  /**
   * Creates and saves a new record under the given schema.
   *
   * @param record the record data
   * @return the created record
   */
  public Record create(Record record) {
    var userId = auth.getCurrentUserId();
    var schema =
        schemaRepository
            .findByIdAndUserId(record.id(), userId)
            .orElseThrow(() -> new IllegalArgumentException("Schema not found"));

    validateAgainstSchema(record, schema.schema());
    return repository.save(record);
  }

  /**
   * Retrieves a paginated list of records for the given schema.
   *
   * @param schemaId the ID of the schema
   * @param page the page number
   * @param size the page size
   * @return a page of records
   */
  public Page<Record> list(String schemaId, int page, int size) {
    return repository.findAllBySchemaIdAndUserId(
        schemaId, auth.getCurrentUserId(), PageRequest.of(page, size));
  }

  /**
   * Retrieves a single record by ID for a specific schema.
   *
   * @param schemaId the schema ID
   * @param recordId the record ID
   * @return an Optional containing the record if found
   */
  public Optional<Record> getById(String schemaId, String recordId) {
    return repository.findByIdAndSchemaIdAndUserId(recordId, schemaId, auth.getCurrentUserId());
  }

  /**
   * Updates an existing record with new data.
   *
   * @param schemaId the ID of the schema
   * @param recordId the ID of the record to update
   * @param record the new data for the record
   * @return an Optional containing the updated record if found
   */
  public Optional<Record> update(String schemaId, String recordId, Record record) {
    var userId = auth.getCurrentUserId();

    return repository
        .findByIdAndSchemaIdAndUserId(recordId, schemaId, userId)
        .flatMap(
            existing -> {
              var schema =
                  schemaRepository
                      .findByIdAndUserId(schemaId, userId)
                      .orElseThrow(() -> new IllegalArgumentException("Schema not found"));

              validateAgainstSchema(record, schema.schema());

              return Optional.of(repository.save(record));
            });
  }

  /**
   * Deletes a record by ID for a given schema.
   *
   * @param schemaId the ID of the schema
   * @param recordId the ID of the record to delete
   * @return true if deleted, false if not found
   */
  public boolean delete(String schemaId, String recordId) {
    var existing =
        repository.findByIdAndSchemaIdAndUserId(recordId, schemaId, auth.getCurrentUserId());
    existing.ifPresent(
        r -> repository.deleteByIdAndSchemaIdAndUserId(r.id(), schemaId, r.userId()));
    return existing.isPresent();
  }

  /**
   * Validates the record data against its schema definition.
   *
   * @param record the record data
   * @param schemaDefinition the schema definition
   */
  private void validateAgainstSchema(Record record, Object schemaDefinition) {
    // TODO: Implement validation logic
  }
}
