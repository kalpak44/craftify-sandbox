package com.craftify.service;

import com.craftify.dto.RecordSummaryDto;
import com.craftify.model.DataRecord;
import com.craftify.repository.RecordsRepository;
import com.craftify.repository.SchemaRepository;
import java.time.Instant;
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
  public DataRecord create(DataRecord record) {
    var userId = auth.getCurrentUserId();
    var schema =
        schemaRepository
            .findByIdAndUserId(record.schemaId(), userId)
            .orElseThrow(() -> new IllegalArgumentException("Schema not found"));

    validateAgainstSchema(record, schema.schema());

    var now = Instant.now();
    return repository.save(
        new DataRecord(
            null,
            record.schemaId(),
            userId,
            record.name(),
            record.description(),
            now,
            now,
            record.data()));
  }

  /**
   * Retrieves a paginated list of record summaries for the given schema.
   *
   * @param schemaId the ID of the schema
   * @param page the page number
   * @param size the page size
   * @return a page of record summaries
   */
  public Page<RecordSummaryDto> list(String schemaId, int page, int size) {
    return repository
        .findAllBySchemaIdAndUserId(schemaId, auth.getCurrentUserId(), PageRequest.of(page, size))
        .map(this::toSummaryDto);
  }

  /**
   * Retrieves a single record by ID for a specific schema.
   *
   * @param schemaId the schema ID
   * @param recordId the record ID
   * @return an Optional containing the record if found
   */
  public Optional<DataRecord> getById(String schemaId, String recordId) {
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
  public Optional<DataRecord> update(String schemaId, String recordId, DataRecord record) {
    var userId = auth.getCurrentUserId();

    return repository
        .findByIdAndSchemaIdAndUserId(recordId, schemaId, userId)
        .map(
            existing -> {
              var schema =
                  schemaRepository
                      .findByIdAndUserId(schemaId, userId)
                      .orElseThrow(() -> new IllegalArgumentException("Schema not found"));

              validateAgainstSchema(record, schema.schema());

              var updated =
                  new DataRecord(
                      existing.id(),
                      existing.schemaId(),
                      existing.userId(),
                      record.name(),
                      record.description(),
                      existing.createdAt(),
                      Instant.now(),
                      record.data());

              return repository.save(updated);
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
  private void validateAgainstSchema(DataRecord record, Object schemaDefinition) {
    // TODO: Implement actual schema validation logic
  }

  /**
   * Converts a Record to a RecordSummaryDto.
   *
   * @param record the full record
   * @return summary DTO
   */
  private RecordSummaryDto toSummaryDto(DataRecord record) {
    return new RecordSummaryDto(
        record.id(), record.name(), record.description(), record.createdAt(), record.updatedAt());
  }
}
