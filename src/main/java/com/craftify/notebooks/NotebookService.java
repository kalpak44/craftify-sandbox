package com.craftify.notebooks;

import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Arrays;
import java.util.Base64;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class NotebookService {

    private static final Logger logger = LoggerFactory.getLogger(NotebookService.class);
    private static final String KUBERNETES_NAMESPACE = "default";
    private static final String CONTAINER_IMAGE = "jupyter/base-notebook:latest";
    private static final long JOB_COMPLETION_TIMEOUT_MINUTES = 5;
    private final NotebookRepository notebookRepository;
    private final KubernetesClient kubernetesClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Autowired
    public NotebookService(NotebookRepository notebookRepository, KubernetesClient kubernetesClient) {
        this.notebookRepository = notebookRepository;
        this.kubernetesClient = kubernetesClient;
    }

    public String getNotebookContent(String notebookId, String userId) {
        var notebook =
                notebookRepository
                        .findById(notebookId)
                        .orElseThrow(
                                () -> new ResourceNotFoundException("Notebook not found with id: " + notebookId));

        if (!notebook.getUserId().equals(userId)) {
            throw new UnauthorizedException("User not authorized to access this notebook.");
        }
        return notebook.getContent();
    }

    public String executeNotebook(String notebookId, String userId) {
        logger.info("Starting execution for notebook ID: {} by user ID: {}", notebookId, userId);

        var notebookContent = getNotebookContent(notebookId, userId);
        var encodedNotebook =
                Base64.getEncoder().encodeToString(notebookContent.getBytes(StandardCharsets.UTF_8));
        var jobName = "notebook-job-" + UUID.randomUUID();

        var commandScript =
                String.format(
                        "echo %s | base64 -d > input.ipynb && "
                                + "jupyter nbconvert --to notebook --execute input.ipynb --output output.ipynb && "
                                + "cat output.ipynb && sleep 5",
                        encodedNotebook);

        var command = Arrays.asList("bash", "-c", commandScript);

        var job =
                new JobBuilder()
                        .withApiVersion("batch/v1")
                        .withNewMetadata()
                        .withName(jobName)
                        .withNamespace(KUBERNETES_NAMESPACE)
                        .endMetadata()
                        .withNewSpec()
                        .withBackoffLimit(0)
                        .withNewTemplate()
                        .withNewSpec()
                        .addNewContainer()
                        .withName("notebook-execution-container")
                        .withImage(CONTAINER_IMAGE)
                        .withCommand(command)
                        .endContainer()
                        .withRestartPolicy("Never")
                        .endSpec()
                        .endTemplate()
                        .endSpec()
                        .build();

        try {
            logger.info("Creating Job {} in Kubernetes...", jobName);
            kubernetesClient.batch().v1().jobs().inNamespace(KUBERNETES_NAMESPACE).createOrReplace(job);

            logger.info("Waiting for Job {} to complete...", jobName);
            kubernetesClient
                    .batch()
                    .v1()
                    .jobs()
                    .inNamespace(KUBERNETES_NAMESPACE)
                    .withName(jobName)
                    .waitUntilCondition(
                            j ->
                                    j != null
                                            && j.getStatus() != null
                                            && ((j.getStatus().getSucceeded() != null && j.getStatus().getSucceeded() > 0)
                                            || (j.getStatus().getFailed() != null && j.getStatus().getFailed() > 0)),
                            JOB_COMPLETION_TIMEOUT_MINUTES,
                            TimeUnit.MINUTES);

            var jobLogs = fetchJobLogs(jobName);

            if (jobSucceeded(jobName)) {
                var notebookNode = tryExtractNotebookJson(jobLogs);
                return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(notebookNode);
            } else {
                throw new RuntimeException("Notebook execution failed. Logs:\n" + jobLogs);
            }
        } catch (Exception e) {
            logger.error("Notebook execution failed: {}", e.getMessage(), e);
            throw new RuntimeException("Notebook execution failed: " + e.getMessage(), e);
        } finally {
            try {
                logger.info("Cleaning up Job {} from Kubernetes...", jobName);
                kubernetesClient
                        .batch()
                        .v1()
                        .jobs()
                        .inNamespace(KUBERNETES_NAMESPACE)
                        .withName(jobName)
                        .delete();
            } catch (Exception cleanupException) {
                logger.warn(
                        "Failed to delete Job {}: {}",
                        jobName,
                        cleanupException.getMessage(),
                        cleanupException);
            }
        }
    }

    private String fetchJobLogs(String jobName) {
        try {
            var pods =
                    kubernetesClient
                            .pods()
                            .inNamespace(KUBERNETES_NAMESPACE)
                            .withLabel("job-name", jobName)
                            .list()
                            .getItems();
            if (!pods.isEmpty()) {
                var podName = pods.get(0).getMetadata().getName();
                return kubernetesClient.pods().inNamespace(KUBERNETES_NAMESPACE).withName(podName).getLog();
            }
            return "No pods found for job: " + jobName;
        } catch (KubernetesClientException e) {
            return "Error fetching logs: " + e.getMessage();
        }
    }

    private boolean jobSucceeded(String jobName) {
        var job =
                kubernetesClient
                        .batch()
                        .v1()
                        .jobs()
                        .inNamespace(KUBERNETES_NAMESPACE)
                        .withName(jobName)
                        .get();
        return job != null
                && job.getStatus() != null
                && job.getStatus().getSucceeded() != null
                && job.getStatus().getSucceeded() > 0;
    }

    private JsonNode tryExtractNotebookJson(String logs) {
        try {
            var jsonStart = logs.indexOf('{');
            var jsonEnd = logs.lastIndexOf('}');
            if (jsonStart >= 0 && jsonEnd > jsonStart) {
                var json = logs.substring(jsonStart, jsonEnd + 1);
                return objectMapper.readTree(json);
            }
        } catch (Exception e) {
            logger.warn("Failed to parse notebook JSON from logs", e);
        }
        return null;
    }

    public Notebook createNotebook(Notebook notebook, String userId) {
        notebook.setUserId(userId);
        return notebookRepository.save(notebook);
    }

    public Page<Notebook> getNotebooksForUser(String userId, Pageable pageable) {
        return notebookRepository.findByUserId(userId, pageable);
    }

    public Notebook getNotebook(String id, String userId) {
        var notebook =
                notebookRepository
                        .findById(id)
                        .orElseThrow(() -> new ResourceNotFoundException("Notebook not found with id: " + id));
        if (!notebook.getUserId().equals(userId)) {
            throw new UnauthorizedException("User not authorized to access this notebook.");
        }
        return notebook;
    }

    public Notebook updateNotebook(String id, Notebook incoming, String userId) {
        var existingNotebook = getNotebook(id, userId);
        existingNotebook.setUpdatedAt(Instant.now());
        existingNotebook.setContent(incoming.getContent());
        return notebookRepository.save(existingNotebook);
    }

    public void deleteNotebook(String id, String userId) {
        var notebook = getNotebook(id, userId);
        notebookRepository.delete(notebook);
    }
}
