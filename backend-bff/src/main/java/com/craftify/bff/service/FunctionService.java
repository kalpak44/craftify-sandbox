package com.craftify.bff.service;

import com.craftify.bff.dto.FunctionDto;
import com.craftify.bff.repository.FunctionRegistrationRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

@Service
public class FunctionService {

    private final FunctionRegistrationRepository repository;
    private final AuthentificationService authentificationService;

    @Autowired
    public FunctionService(FunctionRegistrationRepository repository,
                           AuthentificationService authentificationService) {
        this.repository = repository;
        this.authentificationService = authentificationService;
    }

    public Page<FunctionDto> getAllFunctionsForCurrentUser(Pageable pageable) {
        var userId = authentificationService.getCurrentUserId();
        return repository.findAllByUserId(userId, pageable)
                .map(fn -> new FunctionDto(
                        fn.id(),
                        fn.name(),
                        fn.status(),
                        fn.executionMode()
                ));
    }
}
