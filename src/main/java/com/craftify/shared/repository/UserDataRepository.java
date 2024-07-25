package com.craftify.shared.repository;

import com.craftify.shared.document.UserDataDocument;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.repository.NoRepositoryBean;

@NoRepositoryBean
public interface UserDataRepository<ENTITY extends UserDataDocument, ID>
    extends MongoRepository<ENTITY, ID> {
  Page<ENTITY> findAllByUserId(Pageable pageable, String userId);

  Optional<ENTITY> findByIdAndUserId(ID id, String userId);

  void deleteByIdAndUserId(ID id, String userId);
}
