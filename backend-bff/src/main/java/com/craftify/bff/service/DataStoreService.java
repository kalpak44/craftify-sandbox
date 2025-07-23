package com.craftify.bff.service;

import com.craftify.bff.model.DataStore;
import com.craftify.bff.model.DataStoreRecord;
import com.craftify.bff.repository.DataStoreRecordsRepository;
import com.craftify.bff.repository.DataStoreRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Optional;

/**
 * Service layer for managing DataSchema entities.
 */
@Service
public class DataStoreService {

    private final DataStoreRepository dataStoreRepository;
    private final DataStoreRecordsRepository dataStoreRecordsRepository;
    private final AuthentificationService auth;

    public DataStoreService(
            DataStoreRepository dataStoreRepository, DataStoreRecordsRepository dataStoreRecordsRepository,
            AuthentificationService auth) {
        this.dataStoreRepository = dataStoreRepository;
        this.dataStoreRecordsRepository = dataStoreRecordsRepository;
        this.auth = auth;
    }

    /**
     * Creates and saves a new DataStore.
     *
     * @param schema the schema to create
     * @return the saved DataSchema
     */
    public DataStore create(DataStore schema) {
        return dataStoreRepository.save(
                new DataStore(
                        schema.id(),
                        schema.name(),
                        schema.description(),
                        schema.type(),
                        Instant.now(),
                        auth.getCurrentUserId()));
    }

    /**
     * Retrieves a paginated list of DataStore sorted by name.
     *
     * @param page the page number to retrieve
     * @param size the number of items per page
     * @return a page of DataSchema entities
     */
    public Page<DataStore> list(int page, int size) {
        return dataStoreRepository.findAllByUserId(auth.getCurrentUserId(), PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
    }

    /**
     * Retrieves a DataStore by its ID.
     *
     * @param id the ID of the schema
     * @return an Optional containing the DataSchema if found
     */
    public Optional<DataStore> getById(String id) {
        return dataStoreRepository.findByIdAndUserId(id, auth.getCurrentUserId());
    }

    /**
     * Updates an existing DataStore with new values.
     *
     * @param id            the ID of the existing DataStore
     * @param updatedSchema the new schema data
     * @return an Optional containing the updated schema if the original was found
     */
    public Optional<DataStore> update(String id, DataStore updatedSchema) {
        return dataStoreRepository
                .findByIdAndUserId(id, auth.getCurrentUserId())
                .map(
                        existing ->
                                dataStoreRepository.save(
                                        new DataStore(
                                                existing.id(),
                                                updatedSchema.name(),
                                                updatedSchema.description(),
                                                updatedSchema.type(),
                                                existing.createdAt(),
                                                existing.userId())));
    }

    /**
     * Deletes a DataStore by ID.
     *
     * @param id the ID of the schema to delete
     */
    public void delete(String id) {
        dataStoreRepository
                .findByIdAndUserId(id, auth.getCurrentUserId())
                .ifPresent(schema -> dataStoreRepository.deleteById(schema.id()));
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

    public Page<DataStoreRecord> listRecords(String dataStoreId, int page, int size) {
        Optional<DataStore> dataStoreOpt = dataStoreRepository.findByIdAndUserId(dataStoreId, auth.getCurrentUserId());

        if (dataStoreOpt.isEmpty()) {
            throw new IllegalArgumentException("DataStore not found for the current user.");
        }

        return dataStoreRecordsRepository.findAllByUserIdAndDataStoreId(
                auth.getCurrentUserId(),
                dataStoreId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt"))
        );
    }

}
