package com.craftify.ai.agents;

import com.craftify.ai.agents.api.Agent;
import com.craftify.service.TaskService;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

/**
 * Agent that runs Python code in a Kubernetes job and returns the output logs.
 */
@Component
public class JobRunnerAgent implements Agent {

    private static final Duration TIMEOUT = Duration.ofMinutes(2);
    private static final Duration POLL_INTERVAL = Duration.ofSeconds(2);
    private static final String NAMESPACE = "default";

    private final TaskService taskService;
    private final KubernetesClient k8sClient;

    public JobRunnerAgent(TaskService taskService, KubernetesClient k8sClient) {
        this.taskService = taskService;
        this.k8sClient = k8sClient;
    }

    @Override
    public String getId() {
        return "job-runner";
    }

    @Override
    public String getDescription() {
        return "Executes Python code in a Kubernetes job and returns the result.";
    }

    @Override
    public String getUsageNotes() {
        return """
                ❗ Usage notes for `job-runner`:
                - Input must be a full, self-contained Python script.
                - Do not rely on prior context or external dependencies.
                """;
    }

    @Override
    public String handle(String input) {
        String code = input.trim();
        if (code.isEmpty()) {
            return "⚠️ No code provided.";
        }

        try {
            String jobName = taskService.runJob(code);
            Instant deadline = Instant.now().plus(TIMEOUT);

            while (Instant.now().isBefore(deadline)) {
                Thread.sleep(POLL_INTERVAL.toMillis());

                Pod pod = getJobPod(jobName);
                if (pod == null) continue;

                String phase = pod.getStatus() != null ? pod.getStatus().getPhase() : "unknown";
                if (!"Running".equalsIgnoreCase(phase)
                        && !"Succeeded".equalsIgnoreCase(phase)
                        && !"Failed".equalsIgnoreCase(phase)) {
                    continue;
                }

                try {
                    String log = k8sClient.pods()
                            .inNamespace(NAMESPACE)
                            .withName(pod.getMetadata().getName())
                            .getLog(true)
                            .trim();

                    if (log.isEmpty()) continue;

                    if (isErrorLog(log)) {
                        return "❌ Execution error:\n```\n" + log + "\n```";
                    }

                    return "📄 Output:\n```\n" + log + "\n```";

                } catch (Exception e) {
                    return "⚠️ Failed to retrieve logs: " + e.getMessage();
                }
            }

            return "⌛ Timeout reached. No logs received.";

        } catch (Exception e) {
            return "❌ Failed to start job: " + e.getMessage();
        }
    }

    /**
     * Returns the pod created for the given job.
     */
    private Pod getJobPod(String jobName) {
        List<Pod> pods = k8sClient.pods()
                .inNamespace(NAMESPACE)
                .withLabel("job-name", jobName)
                .list()
                .getItems();

        return pods.isEmpty() ? null : pods.get(0);
    }

    /**
     * Checks if the log contains error-related keywords.
     */
    private boolean isErrorLog(String log) {
        String lower = log.toLowerCase();
        return lower.contains("traceback")
                || lower.contains("syntaxerror")
                || lower.contains("exception")
                || lower.contains("error");
    }
}
