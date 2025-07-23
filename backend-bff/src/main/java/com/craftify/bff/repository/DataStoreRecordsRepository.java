package com.craftify.bff.repository;

import com.craftify.bff.model.DataStoreRecord;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface DataStoreRecordsRepository extends MongoRepository<DataStoreRecord, String> {
    Page<DataStoreRecord> findAllByUserIdAndDataStoreId(String userId, String dataStoreId, Pageable pageable);

    Optional<DataStoreRecord> findByIdAndUserId(String id, String userId);

    Optional<Long> countByUserIdAndDataStoreId(String userId, String dataStoreId);
}