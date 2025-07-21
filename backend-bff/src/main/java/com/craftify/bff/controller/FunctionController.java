package com.craftify.bff.controller;

import com.craftify.bff.common.model.functions.FunctionModule;
import com.craftify.bff.config.FunctionBuilderConfig;
import com.craftify.bff.dto.FunctionDto;
import com.craftify.bff.dto.LogEvent;
import com.craftify.bff.dto.RegisterFunctionDto;
import com.craftify.bff.dto.RegisterFunctionResponse;
import com.craftify.bff.model.RegistrationJob;
import com.craftify.bff.model.UserMenu;
import com.craftify.bff.service.AuthentificationService;
import com.craftify.bff.service.FunctionService;
import com.craftify.bff.service.RegistrationJobStore;
import com.craftify.bff.service.UserMenuService;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.apache.commons.io.FileUtils;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.ObjectId;
import org.eclipse.jgit.lib.Repository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Objects;
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
    private final FunctionBuilderConfig functionBuilderConfig;
    private final UserMenuService userMenuService;
    private final ObjectMapper objectMapper;

    @Autowired
    public FunctionController(FunctionService functionService, RegistrationJobStore jobStore, SimpMessagingTemplate messagingTemplate, AuthentificationService authentificationService, FunctionBuilderConfig functionBuilderConfig, UserMenuService userMenuService, ObjectMapper objectMapper) {
        this.functionService = functionService;
        this.jobStore = jobStore;
        this.messagingTemplate = messagingTemplate;
        this.authentificationService = authentificationService;
        this.functionBuilderConfig = functionBuilderConfig;
        this.userMenuService = userMenuService;
        this.objectMapper = objectMapper;
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
        var jobPath = Path.of(functionBuilderConfig.getTempPath().toString(), job.id);
        var jobPathFile = jobPath.toFile();
        try {
            jobPathFile.mkdirs();
            FileUtils.copyDirectory(functionBuilderConfig.getTemplatePath().toFile(), jobPathFile);
            Path userPath = Path.of(jobPathFile.toString(), "user");
            FileUtils.forceDelete(userPath.toFile());
            Thread.sleep(5000);
            send(job, "Starting registration...", "in-progress", null);
            send(job, "Cloning repo: " + req.repo(), "in-progress", null);

            try (Git repo = Git.cloneRepository()
                    .setURI(req.repo())
                    .setDirectory(userPath.toFile())
                    .setBranch("refs/heads/" + req.branch())
                    .call()) {

                Repository repository = repo.getRepository();

                ObjectId lastCommitId = repository.resolve("refs/heads/" + req.branch());
                String lastCommitHash = lastCommitId.getName();

                var modulePath = Path.of(jobPathFile.toString(), "user", "module.json").toFile();
                if (!modulePath.exists() || !modulePath.isFile()) {
                    throw new IllegalArgumentException("module.json file does not exist or is not a file");
                }


                FunctionModule module = objectMapper.readValue(modulePath, FunctionModule.class);
                List<FunctionModule.Page> pages = Objects.requireNonNullElse(module.pages(), List.of());
                List<UserMenu> userMenus = pages.stream()
                        .map(page -> {
                            Path pagePath = jobPath.resolve("user").resolve(Paths.get(Objects.requireNonNullElse(page.file(), "")));
                            if (!pagePath.toFile().exists() && !pagePath.toFile().isFile()) {
                                throw new IllegalArgumentException("page.json file does not exist or is not a file");
                            }

                            FunctionModule.Page.Menu menu = page.menu();
                            List<UserMenu.MenuPathElement> path = menu.path().stream()
                                    .map(mp -> new UserMenu.MenuPathElement(mp.id(), mp.label()))
                                    .toList();

                            return new UserMenu(
                                    null,
                                    currentUserId,
                                    path,
                                    menu.id(),
                                    menu.label(),
                                    page.route()
                            );
                        })
                        .toList();


                userMenuService.saveMenus(userMenus, currentUserId);


                send(job, "Repo successful cloned, use commit #%s".formatted(lastCommitHash), "in-progress", null);
                send(job, "Installing dependencies...", "in-progress", null);
                Thread.sleep(1500);
                send(job, "Building container...", "in-progress", null);
                Thread.sleep(700);
                send(job, "Registering function in platform...", "in-progress", null);
                Thread.sleep(800);
                job.status = "success";
                send(job, "Registration complete!", "success", null);
                functionService.saveFunction(req.repo(), req.type(), currentUserId, lastCommitHash);
            }

        } catch (Exception e) {
            job.status = "error";
            job.error = e.getMessage();
            send(job, "[error] " + e.getMessage(), "error", e.getMessage());
        } finally {
            try {
                FileUtils.forceDelete(jobPathFile);
            } catch (IOException e) {
            }
        }
    }
/*
    public static void printMenuTree(MenuTreeNode node, String indent) {
        System.out.println(indent + node.label() + (node.leafMenu() != null ? " [MENU]" : ""));
        for (MenuTreeNode child : node.children()) {
            printMenuTree(child, indent + "  ");
        }
    }*/

    private void send(RegistrationJob job, String message, String status, String error) {
        var log = new LogEvent(message, status, error);
        job.logs.add(log);
        messagingTemplate.convertAndSend("/topic/registration/" + job.id, log);
    }
}
