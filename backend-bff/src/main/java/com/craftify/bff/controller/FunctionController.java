package com.craftify.bff.controller;

import com.craftify.bff.dto.FunctionDto;
import com.craftify.bff.dto.LogEvent;
import com.craftify.bff.dto.RegisterFunctionDto;
import com.craftify.bff.dto.RegisterFunctionResponse;
import com.craftify.bff.model.RegistrationJob;
import com.craftify.bff.service.AuthentificationService;
import com.craftify.bff.service.FunctionService;
import com.craftify.bff.service.RegistrationJobStore;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/function")
@Tag(
        name = "Function",
        description = "Operations for function registration"
)
public class FunctionController {

    private final FunctionService functionService;
    private final RegistrationJobStore jobStore;
    private final SimpMessagingTemplate messagingTemplate;
    private final AuthentificationService authentificationService;

    @Autowired
    public FunctionController(FunctionService functionService, RegistrationJobStore jobStore, SimpMessagingTemplate messagingTemplate, AuthentificationService authentificationService) {
        this.functionService = functionService;
        this.jobStore = jobStore;
        this.messagingTemplate = messagingTemplate;
        this.authentificationService = authentificationService;
    }

    @GetMapping("/list")
    public Page<FunctionDto> list(Pageable pageable) {
        var currentUserId = authentificationService.getCurrentUserId();
        return functionService.getAllFunctionsForCurrentUser(pageable, currentUserId);
    }

    @PostMapping("/register")
    public RegisterFunctionResponse register(@RequestBody RegisterFunctionDto req) {
        String jobId = UUID.randomUUID().toString();
        RegistrationJob job = jobStore.create(jobId);
        var currentUserId = authentificationService.getCurrentUserId();
        // Start simulation in background
        new Thread(() -> simulateRegistration(job, req, currentUserId)).start();

        return new RegisterFunctionResponse(jobId);
    }

    private void simulateRegistration(RegistrationJob job, RegisterFunctionDto req, String currentUserId) {
        try {
            send(job, "Starting registration...", "in-progress", null);
            Thread.sleep(500);
            send(job, "Cloning repo: " + req.repo(), "in-progress", null);
            Thread.sleep(5000);
            send(job, "Installing dependencies...", "in-progress", null);
            Thread.sleep(1500);
            send(job, "Building container...", "in-progress", null);
            Thread.sleep(700);
            send(job, "Registering function in platform...", "in-progress", null);
            Thread.sleep(800);
            job.status = "success";
            send(job, "Registration complete!", "success", null);
            functionService.saveFunction(req.repo(), currentUserId);
        } catch (Exception e) {
            job.status = "error";
            job.error = e.getMessage();
            send(job, "[error] " + e.getMessage(), "error", e.getMessage());
        }
    }

    private void send(RegistrationJob job, String message, String status, String error) {
        var log = new LogEvent(message, status, error);
        job.logs.add(log);
        messagingTemplate.convertAndSend("/topic/registration/" + job.id, log);
    }
}
