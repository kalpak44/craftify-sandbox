package com.craftify.notebooks;

import com.craftify.auth.AuthUtil;
import com.craftify.common.PaginationUtil;
import com.craftify.auth.AuthUtil;
import com.craftify.common.exception.ResourceNotFoundException;
import com.craftify.common.exception.UnauthorizedException;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.api.model.Volume;
import io.fabric8.kubernetes.api.model.VolumeMount;
import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.*;
import java.nio.file.attribute.BasicFileAttributes;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Service
public class NotebookService {

    private static final Logger logger = LoggerFactory.getLogger(NotebookService.class);

    private final NotebookRepository notebookRepository;
    private final AuthUtil authUtil;
    private final KubernetesClient kubernetesClient;

    // TODO: Externalize these properties
    private static final String KUBERNETES_NAMESPACE = "default";
    private static final String CONTAINER_IMAGE = "jupyter/base-notebook:latest"; // Ensure papermill is in this image or use one that has it.
    private static final String MOUNT_PATH_IN_CONTAINER = "/mnt/notebooks";
    private static final String INPUT_FILE_NAME = "input.ipynb";
    private static final String OUTPUT_FILE_NAME = "output.ipynb";
    private static final long JOB_COMPLETION_TIMEOUT_MINUTES = 5;


    @Autowired
    public NotebookService(NotebookRepository notebookRepository, AuthUtil authUtil, KubernetesClient kubernetesClient) {
        this.notebookRepository = notebookRepository;
        this.authUtil = authUtil;
        this.kubernetesClient = kubernetesClient;
    }

    public String getNotebookContent(String notebookId, String userId) {
        Notebook notebook = notebookRepository.findById(notebookId)
                .orElseThrow(() -> new ResourceNotFoundException("Notebook not found with id: " + notebookId));

        if (!notebook.getUserId().equals(userId)) {
            throw new UnauthorizedException("User not authorized to access this notebook.");
        }
        return notebook.getContent();
    }

    public String executeNotebook(String notebookId, String userId) {
        logger.info("Starting execution for notebook ID: {} by user ID: {}", notebookId, userId);
        String notebookContent = getNotebookContent(notebookId, userId);
        Path tempDir = null;

        try {
            // 1. Temporary File Handling
            tempDir = Files.createTempDirectory("notebook-execution-" + UUID.randomUUID());
            Path inputNotebookPath = tempDir.resolve(INPUT_FILE_NAME);
            Files.writeString(inputNotebookPath, notebookContent, StandardOpenOption.CREATE);
            logger.info("Notebook content written to temporary file: {}", inputNotebookPath);

            // 2. Fabric8 Kubernetes Client Integration
            String jobName = "notebook-job-" + UUID.randomUUID().toString();
            logger.info("Defining Kubernetes Job: {} in namespace: {}", jobName, KUBERNETES_NAMESPACE);

            final String hostPathDir = tempDir.toAbsolutePath().toString();

            Volume volume = new VolumeBuilder()
                    .withName("notebook-volume")
                    .withNewHostPath()
                        .withPath(hostPathDir)
                        .withType("DirectoryOrCreate") // Ensures the directory exists on the node
                    .endHostPath()
                    .build();

            VolumeMount volumeMount = new VolumeMountBuilder()
                    .withName("notebook-volume")
                    .withMountPath(MOUNT_PATH_IN_CONTAINER)
                    .build();
            
            // Command to execute the notebook. This assumes papermill is installed in the image.
            // A more robust solution might involve a custom image or init containers to install tools.
            List<String> command = Arrays.asList(
                    "papermill",
                    MOUNT_PATH_IN_CONTAINER + "/" + INPUT_FILE_NAME,
                    MOUNT_PATH_IN_CONTAINER + "/" + OUTPUT_FILE_NAME
                    // Add other papermill options if needed, e.g., kernel name
            );
            // As an alternative, if papermill is not easily available, use jupyter nbconvert (less ideal for parameterization)
            // List<String> command = Arrays.asList(
            //         "jupyter", "nbconvert", "--to", "notebook", "--execute",
            //         MOUNT_PATH_IN_CONTAINER + "/" + INPUT_FILE_NAME,
            //         "--output", MOUNT_PATH_IN_CONTAINER + "/" + OUTPUT_FILE_NAME
            // );


            Job job = new JobBuilder()
                    .withApiVersion("batch/v1")
                    .withNewMetadata()
                        .withName(jobName)
                        .withNamespace(KUBERNETES_NAMESPACE)
                    .endMetadata()
                    .withNewSpec()
                        .withNewTemplate()
                            .withNewSpec()
                                .addNewContainer()
                                    .withName("notebook-execution-container")
                                    .withImage(CONTAINER_IMAGE)
                                    .withCommand(command)
                                    .withVolumeMounts(volumeMount)
                                .endContainer()
                                .withVolumes(volume)
                                .withRestartPolicy("Never") // Or "OnFailure"
                            .endSpec()
                        .endTemplate()
                        // Optional: Set backoffLimit, activeDeadlineSeconds etc.
                        // .withBackoffLimit(1) 
                    .endSpec()
                    .build();

            logger.info("Creating Job {} in Kubernetes...", jobName);
            kubernetesClient.batch().v1().jobs().inNamespace(KUBERNETES_NAMESPACE).createOrReplace(job);

            logger.info("Waiting for Job {} to complete (timeout: {} minutes)...", jobName, JOB_COMPLETION_TIMEOUT_MINUTES);
            kubernetesClient.batch().v1().jobs().inNamespace(KUBERNETES_NAMESPACE).withName(jobName)
                    .waitUntilCondition(
                            j -> j != null && j.getStatus() != null &&
                                 ( (j.getStatus().getSucceeded() != null && j.getStatus().getSucceeded() > 0) ||
                                   (j.getStatus().getFailed() != null && j.getStatus().getFailed() > 0) ),
                            JOB_COMPLETION_TIMEOUT_MINUTES, TimeUnit.MINUTES
                    );

            Job completedJob = kubernetesClient.batch().v1().jobs().inNamespace(KUBERNETES_NAMESPACE).withName(jobName).get();
            String jobLogs = "";
            try {
                List<Pod> pods = kubernetesClient.pods().inNamespace(KUBERNETES_NAMESPACE).withLabel("job-name", jobName).list().getItems();
                if (!pods.isEmpty()) {
                    // Assuming one pod per job for simplicity
                    String podName = pods.get(0).getMetadata().getName();
                    logger.info("Fetching logs for pod: {}", podName);
                    jobLogs = kubernetesClient.pods().inNamespace(KUBERNETES_NAMESPACE).withName(podName).getLog();
                } else {
                    logger.warn("No pods found for job: {}", jobName);
                    jobLogs = "No pods found for job: " + jobName;
                }
            } catch (KubernetesClientException e) {
                logger.error("Kubernetes client exception while fetching logs for job {}: {}", jobName, e.getMessage(), e);
                jobLogs = "Error fetching logs: " + e.getMessage();
            }


            if (completedJob != null && completedJob.getStatus() != null && completedJob.getStatus().getSucceeded() != null && completedJob.getStatus().getSucceeded() > 0) {
                logger.info("Job {} completed successfully.", jobName);
                Path outputNotebookPath = tempDir.resolve(OUTPUT_FILE_NAME);
                if (Files.exists(outputNotebookPath)) {
                    String outputContent = Files.readString(outputNotebookPath);
                    logger.info("Output notebook content successfully read from: {}", outputNotebookPath);
                    return outputContent; // Return content of output.ipynb
                } else {
                    logger.warn("Output notebook file {} not found, returning logs instead.", outputNotebookPath);
                    return "Job Succeeded. Output file not found. Logs:\n" + jobLogs;
                }
            } else {
                String failureReason = "Unknown";
                if (completedJob != null && completedJob.getStatus() != null && completedJob.getStatus().getConditions() != null && !completedJob.getStatus().getConditions().isEmpty()) {
                    failureReason = completedJob.getStatus().getConditions().get(0).getMessage();
                }
                logger.error("Job {} failed. Reason: {}. Logs:\n{}", jobName, failureReason, jobLogs);
                throw new RuntimeException("Notebook execution failed for job " + jobName + ". Reason: " + failureReason + "\nLogs: " + jobLogs);
            }

        } catch (IOException e) {
            logger.error("IOException during notebook execution for ID {}: {}", notebookId, e.getMessage(), e);
            throw new RuntimeException("Error during file operations for notebook " + notebookId + ": " + e.getMessage(), e);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            logger.error("Notebook execution interrupted for ID {}: {}", notebookId, e.getMessage(), e);
            throw new RuntimeException("Notebook execution interrupted for notebook " + notebookId + ": " + e.getMessage(), e);
        } catch (KubernetesClientException e) {
            logger.error("Kubernetes client exception during notebook execution for ID {}: {}", notebookId, e.getMessage(), e);
            throw new RuntimeException("Kubernetes error during notebook execution for " + notebookId + ": " + e.getMessage(), e);
        } catch (Exception e) {
            logger.error("Unexpected error during notebook execution for ID {}: {}", notebookId, e.getMessage(), e);
            throw new RuntimeException("Unexpected error during notebook execution for " + notebookId + ": " + e.getMessage(), e);
        } finally {
            if (tempDir != null) {
                try {
                    logger.info("Cleaning up temporary directory: {}", tempDir);
                    // Recursively delete the temporary directory
                    Files.walkFileTree(tempDir, new SimpleFileVisitor<Path>() {
                        @Override
                        public FileVisitResult visitFile(Path file, BasicFileAttributes attrs) throws IOException {
                            Files.delete(file);
                            return FileVisitResult.CONTINUE;
                        }

                        @Override
                        public FileVisitResult postVisitDirectory(Path dir, IOException exc) throws IOException {
                            Files.delete(dir);
                            return FileVisitResult.CONTINUE;
                        }
                    });
                    logger.info("Temporary directory {} cleaned up successfully.", tempDir);
                } catch (IOException e) {
                    logger.error("Failed to delete temporary directory {}: {}", tempDir, e.getMessage(), e);
                }
            }
        }
    }

    // Business logic methods
    public Notebook createNotebook(Notebook notebook, String userId) {
        notebook.setUserId(userId);
        return notebookRepository.save(notebook);
    }

    public Page<Notebook> getNotebooksForUser(String userId, Pageable pageable) {
        return notebookRepository.findByUserId(userId, pageable);
    }

    public Notebook getNotebook(String id, String userId) {
        Notebook notebook = notebookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notebook not found with id: " + id));
        if (!notebook.getUserId().equals(userId)) {
            throw new UnauthorizedException("User not authorized to access this notebook.");
        }
        return notebook;
    }

    public Notebook updateNotebook(String id, Notebook incoming, String userId) {
        Notebook existingNotebook = getNotebook(id, userId); // Ensures notebook exists and user is authorized
        existingNotebook.setName(incoming.getName());
        existingNotebook.setDescription(incoming.getDescription());
        existingNotebook.setContent(incoming.getContent());
        existingNotebook.setTags(incoming.getTags());
        return notebookRepository.save(existingNotebook);
    }

    public void deleteNotebook(String id, String userId) {
        Notebook notebook = getNotebook(id, userId); // Ensures notebook exists and user is authorized
        notebookRepository.delete(notebook);
    }
}
