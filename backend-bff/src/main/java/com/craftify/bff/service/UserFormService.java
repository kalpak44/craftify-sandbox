package com.craftify.bff.service;

import com.craftify.bff.model.Form;
import com.craftify.bff.repository.UserFormRepository;
import java.time.Instant;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;

@Service
public class UserFormService {

  private final UserFormRepository userFormRepository;

  public UserFormService(UserFormRepository userFormRepository) {
    this.userFormRepository = userFormRepository;
  }

  public Page<Form> getAllFormsForCurrentUser(int page, int size, String currentUserId) {
    return userFormRepository.findAllByUserId(
        currentUserId, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "updatedAt")));
  }

  public Form saveForm(Form entity) {
    Instant now = Instant.now();
    return userFormRepository.save(
        new Form(
            null,
            entity.name(),
            now,
            now,
            Objects.requireNonNullElse(entity.fields(), List.of()),
            entity.userId()));
  }

  public Optional<Form> getDetails(String currentUserId, String id) {
    return userFormRepository.findByIdAndUserId(id, currentUserId);
  }
}
