package com.craftify.ai.tools;

import com.craftify.service.TaskService;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.client.KubernetesClient;
import java.time.Duration;
import java.time.Instant;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.tool.annotation.Tool;
import org.springframework.stereotype.Component;

/**
 * Tool component for executing full Python scripts in a Kubernetes job. Submits, monitors,
 * retrieves logs, and performs cleanup post-execution.
 */
@Component
public class JobRunnerTool {

  private static final Logger logger = LoggerFactory.getLogger(JobRunnerTool.class);

  private static final Duration TIMEOUT = Duration.ofMinutes(2);
  private static final Duration POLL_INTERVAL = Duration.ofSeconds(2);
  private static final String NAMESPACE = "default";

  private final TaskService taskService;
  private final KubernetesClient k8sClient;

  /**
   * Constructs a new JobRunnerTool with required services.
   *
   * @param taskService Service responsible for creating and managing jobs.
   * @param k8sClient Kubernetes client used to interact with the cluster.
   */
  public JobRunnerTool(TaskService taskService, KubernetesClient k8sClient) {
    this.taskService = taskService;
    this.k8sClient = k8sClient;
  }

  /**
   * Executes a complete Python script in a Kubernetes job and returns the job's output logs.
   * Automatically deletes the job and associated resources after completion.
   *
   * @param code A valid, full Python script to execute.
   * @return Standard output or error logs from the job execution.
   */
  @Tool(
      name = "runPythonCode",
      description =
          """
            Executes a complete Python script inside a Kubernetes Job and returns its output logs.
            Input must be a valid, standalone Python script—not a code snippet or function fragment.
            """)
  public String runPythonCode(String code) {
    if (code == null || code.trim().isEmpty()) {
      logger.warn("No Python code provided for execution.");
      return "Error: No Python code provided.";
    }

    String jobName = null;
    try {
      logger.info("Starting Kubernetes job for script execution...");
      jobName = taskService.runJob(code);
      var deadline = Instant.now().plus(TIMEOUT);

      while (Instant.now().isBefore(deadline)) {
        Thread.sleep(POLL_INTERVAL.toMillis());

        var pod = getJobPod(jobName);
        if (pod == null) continue;

        var phase = pod.getStatus() != null ? pod.getStatus().getPhase() : "unknown";
        if (!"Running".equalsIgnoreCase(phase)
            && !"Succeeded".equalsIgnoreCase(phase)
            && !"Failed".equalsIgnoreCase(phase)) {
          continue;
        }

        try {
          var log =
              k8sClient
                  .pods()
                  .inNamespace(NAMESPACE)
                  .withName(pod.getMetadata().getName())
                  .getLog(true)
                  .trim();

          if (log.isEmpty()) continue;

          if (isErrorLog(log)) {
            logger.error("Job {} completed with errors.", jobName);
            return "Execution failed with error:\n```\n" + log + "\n```";
          }

          logger.info("Job {} executed successfully.", jobName);
          return "Execution completed successfully:\n```\n" + log + "\n```";
        } catch (Exception e) {
          logger.error("Error retrieving logs for job {}: {}", jobName, e.getMessage(), e);
          return "Error retrieving logs: " + e.getMessage();
        }
      }

      logger.warn("Timed out while waiting for job {} to complete.", jobName);
      return "Timed out while waiting for job logs.";
    } catch (Exception e) {
      logger.error("Failed to start job: {}", e.getMessage(), e);
      return "Failed to start job: " + e.getMessage();
    } finally {
      if (jobName != null) {
        cleanupJob(jobName);
      }
    }
  }

  /**
   * Retrieves the Pod associated with a given job name.
   *
   * @param jobName Name of the Kubernetes job.
   * @return Pod instance if found; otherwise, null.
   */
  private Pod getJobPod(String jobName) {
    var pods =
        k8sClient.pods().inNamespace(NAMESPACE).withLabel("job-name", jobName).list().getItems();

    return pods.isEmpty() ? null : pods.get(0);
  }

  /**
   * Determines if the provided log output indicates an error.
   *
   * @param log The log output from the job.
   * @return True if the log contains common error indicators; false otherwise.
   */
  private boolean isErrorLog(String log) {
    var lower = log.toLowerCase();
    return lower.contains("traceback")
        || lower.contains("syntaxerror")
        || lower.contains("exception")
        || lower.contains("error");
  }

  /**
   * Deletes the Kubernetes Job and its associated resources to keep the environment clean.
   *
   * @param jobName Name of the Kubernetes job to delete.
   */
  private void cleanupJob(String jobName) {
    try {
      logger.info("Cleaning up Kubernetes job: {}", jobName);
      k8sClient.batch().v1().jobs().inNamespace(NAMESPACE).withName(jobName).delete();
      logger.info("Job {} deleted successfully.", jobName);
    } catch (Exception e) {
      logger.warn("Failed to delete job {}: {}", jobName, e.getMessage(), e);
    }
  }
}
