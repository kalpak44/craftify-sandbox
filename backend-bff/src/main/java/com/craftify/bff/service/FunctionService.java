package com.craftify.bff.service;

import com.craftify.bff.dto.FunctionDto;
import com.craftify.bff.model.FunctionRegistration;
import com.craftify.bff.repository.FunctionRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.time.Instant;

@Service
public class FunctionService {

    private final FunctionRegistrationRepository repository;

    @Autowired
    public FunctionService(FunctionRegistrationRepository repository) {
        this.repository = repository;
    }

    public Page<FunctionDto> getAllFunctionsForCurrentUser(Pageable pageable, String userId) {
        return repository.findAllByUserId(userId, pageable)
                .map(fn -> new FunctionDto(
                        fn.id(),
                        fn.name(),
                        fn.status(),
                        fn.executionMode()
                ));
    }

    public void saveFunction(String functionName, String functionType, String userId, String commitHash) {
        Instant now = Instant.now();
        repository.save(new FunctionRegistration(null, userId, functionName, "ACTIVE", functionType, commitHash, now));
    }

    public void delete(String userId, String id) {
        repository.deleteByIdAndUserId(id, userId);
    }
}
