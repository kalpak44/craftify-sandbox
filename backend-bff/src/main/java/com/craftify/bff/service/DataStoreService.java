package com.craftify.bff.service;

import com.craftify.bff.model.DataStore;
import com.craftify.bff.model.DataStoreRecord;
import com.craftify.bff.model.DataStoreRecordDetails;
import com.craftify.bff.repository.DataStoreRecordsRepository;
import com.craftify.bff.repository.DataStoreRepository;
import java.time.Instant;
import java.util.Map;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class DataStoreService {

  private final DataStoreRepository dataStoreRepository;
  private final DataStoreRecordsRepository dataStoreRecordsRepository;
  private final AuthentificationService auth;

  public DataStoreService(
      DataStoreRepository dataStoreRepository,
      DataStoreRecordsRepository dataStoreRecordsRepository,
      AuthentificationService auth) {
    this.dataStoreRepository = dataStoreRepository;
    this.dataStoreRecordsRepository = dataStoreRecordsRepository;
    this.auth = auth;
  }

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

  public Page<DataStore> list(int page, int size) {
    return dataStoreRepository.findAllByUserId(
        auth.getCurrentUserId(),
        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
  }

  public Optional<DataStoreRecordDetails> getDetails(String dataStoreId, String recordId) {
    DataStore dataStore =
        dataStoreRepository
            .findByIdAndUserId(dataStoreId, auth.getCurrentUserId())
            .orElseThrow(
                () -> new IllegalArgumentException("DataStore not found for the current user."));

    DataStoreRecord record =
        dataStoreRecordsRepository
            .findByIdAndUserId(recordId, auth.getCurrentUserId())
            .orElseThrow(
                () -> new IllegalArgumentException("Record not found for the current user."));

    return Optional.of(
        new DataStoreRecordDetails(
            record.name(),
            record.createdAt(),
            record.updatedAt(),
            dataStore.name(),
            dataStore.type(),
            record.record()));
  }

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

  public void delete(String id) {
    dataStoreRepository
        .findByIdAndUserId(id, auth.getCurrentUserId())
        .ifPresent(schema -> dataStoreRepository.deleteById(schema.id()));
  }

  public Long recordsCount(String dataStoreId) {
    return dataStoreRecordsRepository
        .countByUserIdAndDataStoreId(auth.getCurrentUserId(), dataStoreId)
        .orElse(0L);
  }

  public boolean canDelete(String id) {
    // Placeholder logic; implement check if needed
    return true;
  }

  public Page<DataStoreRecord> listRecords(String dataStoreId, int page, int size) {
    dataStoreRepository
        .findByIdAndUserId(dataStoreId, auth.getCurrentUserId())
        .orElseThrow(
            () -> new IllegalArgumentException("DataStore not found for the current user."));

    return dataStoreRecordsRepository.findAllByUserIdAndDataStoreId(
        auth.getCurrentUserId(),
        dataStoreId,
        PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt")));
  }

  public DataStoreRecord createRecord(String dataStoreId, String name, Map<String, Object> record) {
    dataStoreRepository
        .findByIdAndUserId(dataStoreId, auth.getCurrentUserId())
        .orElseThrow(
            () -> new IllegalArgumentException("DataStore not found for the current user."));

    boolean exists =
        dataStoreRecordsRepository.existsByUserIdAndDataStoreIdAndNameIgnoreCase(
            auth.getCurrentUserId(), dataStoreId, name);

    if (exists) {
      throw new IllegalStateException("A record with this name already exists.");
    }

    Instant now = Instant.now();
    var entity =
        new DataStoreRecord(null, name, dataStoreId, now, now, record, auth.getCurrentUserId());

    return dataStoreRecordsRepository.save(entity);
  }
}
