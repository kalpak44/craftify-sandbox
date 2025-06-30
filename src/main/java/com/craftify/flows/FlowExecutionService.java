package com.craftify.flows;

import com.craftify.common.exception.ServerException;
import com.craftify.service.TaskService;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import io.fabric8.kubernetes.api.model.Pod;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

@Service
public class FlowExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(FlowExecutionService.class);
    private static final Duration JOB_TIMEOUT = Duration.ofMinutes(5);
    private static final Duration POLL_INTERVAL = Duration.ofSeconds(2);
    private static final String NAMESPACE = "default";
    
    private final ObjectMapper objectMapper;
    private final FlowExecutionHistoryService flowExecutionHistoryService;
    private final TaskService taskService;
    private final KubernetesClient kubernetesClient;
    private final SimpMessagingTemplate messagingTemplate;

    public FlowExecutionService(ObjectMapper objectMapper, 
                              FlowExecutionHistoryService flowExecutionHistoryService,
                              TaskService taskService,
                              KubernetesClient kubernetesClient,
                              SimpMessagingTemplate messagingTemplate) {
        this.objectMapper = objectMapper;
        this.flowExecutionHistoryService = flowExecutionHistoryService;
        this.taskService = taskService;
        this.kubernetesClient = kubernetesClient;
        this.messagingTemplate = messagingTemplate;
    }

    public Flow executeFlow(Flow flow) {
        logger.info("Starting execution of flow: {}", flow.getName());

        Instant executionStartTime = Instant.now();
        int nodesExecuted = 0;
        StringBuilder executionLogs = new StringBuilder();

        // Create execution history record
        FlowExecutionHistory history = flowExecutionHistoryService.createExecutionHistory(
                flow.getId(),
                flow.getUserId(),
                flow.getName(),
                flow.getConfiguration()
        );

        try {
            String configuration = flow.getConfiguration();
            JsonNode config = objectMapper.readTree(configuration);

            JsonNode nodes = config.get("nodes");
            JsonNode edges = config.get("edges");

            // Build node map
            Map<String, JsonNode> nodeMap = new HashMap<>();
            for (JsonNode node : nodes) {
                nodeMap.put(node.get("id").asText(), node);
            }

            // Build adjacency map (forward edges)
            Map<String, List<String>> graph = new HashMap<>();
            Set<String> targets = new HashSet<>();
            for (JsonNode edge : edges) {
                String source = edge.get("source").asText();
                String target = edge.get("target").asText();
                graph.computeIfAbsent(source, k -> new ArrayList<>()).add(target);
                targets.add(target);
            }

            // Find root nodes
            List<String> roots = nodeMap.keySet().stream()
                    .filter(id -> !targets.contains(id))
                    .toList();

            Set<String> visited = new HashSet<>();
            for (String root : roots) {
                nodesExecuted += traverseAndExecuteWithEvents(root, nodeMap, graph, visited, executionLogs, flow.getId());
            }

            // Return updated config as JSON string
            String updatedConfigJson = objectMapper.writeValueAsString(config);

            // Calculate execution time
            long totalExecutionTime = Duration.between(executionStartTime, Instant.now()).toMillis();

            // Update execution history with success status and details
            flowExecutionHistoryService.updateExecutionStatus(
                history.getId(), 
                "SUCCESS", 
                null, 
                updatedConfigJson,
                totalExecutionTime,
                nodesExecuted,
                executionLogs.toString()
            );

            // Notify FE: flow completed
            messagingTemplate.convertAndSend("/topic/flow-execution/" + flow.getId(),
                Map.of("type", "flow_execution", "status", "completed"));
            return flow;

        } catch (Exception e) {
            logger.error("Error executing flow: {}", e.getMessage(), e);
            
            // Calculate execution time
            long totalExecutionTime = Duration.between(executionStartTime, Instant.now()).toMillis();
            
            // Update execution history with failure status
            flowExecutionHistoryService.updateExecutionStatus(
                history.getId(), 
                "FAILED", 
                e.getMessage(),
                null,
                totalExecutionTime,
                nodesExecuted,
                executionLogs.toString()
            );
            
            // Notify FE: flow failed
            messagingTemplate.convertAndSend("/topic/flow-execution/" + flow.getId(),
                Map.of("type", "flow_execution", "status", "failed", "error", e.getMessage()));
            
            throw new ServerException("Error executing flow: %s".formatted(e.getMessage()));
        }
    }

    private int traverseAndExecuteWithEvents(String nodeId, Map<String, JsonNode> nodeMap, Map<String, List<String>> graph, Set<String> visited, StringBuilder executionLogs, String flowId) {
        if (visited.contains(nodeId)) return 0;
        visited.add(nodeId);
        JsonNode node = nodeMap.get(nodeId);
        if (node == null) return 0;
        // Notify FE: node execution started
        messagingTemplate.convertAndSend("/topic/flow-execution/" + flowId,
            Map.of("type", "node_execution", "nodeId", nodeId, "status", "started"));
        int executed = 0;
        if ("action".equals(node.get("type").asText())) {
            executeActionNode(node, executionLogs, flowId);
            executed++;
        } else if ("manualTrigger".equals(node.get("type").asText()) || "cronTrigger".equals(node.get("type").asText())) {
            // Simulate trigger node execution
            executed++;
        }
        List<String> children = graph.getOrDefault(nodeId, List.of());
        for (String child : children) {
            executed += traverseAndExecuteWithEvents(child, nodeMap, graph, visited, executionLogs, flowId);
        }
        return executed;
    }

    private void executeActionNode(JsonNode node, StringBuilder executionLogs, String flowId) {
        try {
            // Extract configuration from node data
            JsonNode data = node.get("data");
            String nodeId = node.get("id").asText();
            
            // Extract execution configuration
            String dockerImage = data.has("dockerImage") ? data.get("dockerImage").asText() : "kalpak44/job-runner:latest";
            String command = data.has("command") ? data.get("command").asText() : "print('No command provided')";
            int timeout = data.has("timeout") ? data.get("timeout").asInt() : 300; // Default 5 minutes
            String code = data.has("code") ? data.get("code").asText() : null;
            
            executionLogs.append(String.format("[%s] Executing action node: %s\n", Instant.now(), nodeId));
            executionLogs.append(String.format("[%s] Docker image: %s\n", Instant.now(), dockerImage));
            executionLogs.append(String.format("[%s] Command: %s\n", Instant.now(), command));
            executionLogs.append(String.format("[%s] Timeout: %d seconds\n", Instant.now(), timeout));
            
            if (code != null) {
                executionLogs.append(String.format("[%s] Code preview: %s\n", 
                    Instant.now(), code.substring(0, Math.min(code.length(), 100)) + "..."));
            }
            
            // Emit: container prepared
            messagingTemplate.convertAndSend("/topic/flow-execution/" + flowId,
                Map.of("type", "node_log", "nodeId", nodeId, "log", "Container prepared for execution."));

            logger.info("Executing action node {} with docker image: {}, command: {}", nodeId, dockerImage, command);
            
            // Create and submit job with custom configuration
            String jobName = createCustomJob(dockerImage, command, code, timeout);
            executionLogs.append(String.format("[%s] Job submitted: %s\n", Instant.now(), jobName));
            logger.info("Job submitted with name: {}", jobName);

            // Emit: container scheduled
            messagingTemplate.convertAndSend("/topic/flow-execution/" + flowId,
                Map.of("type", "node_log", "nodeId", nodeId, "log", "Container scheduled: " + jobName));

            // Monitor job execution with custom timeout
            JobExecutionResult result = monitorJobExecutionWithLogs(jobName, Duration.ofSeconds(timeout), flowId, nodeId);
            
            // Update node with execution results
            ObjectNode dataNode = (ObjectNode) data;
            dataNode.put("code", result.exitCode);
            dataNode.put("output", result.output);
            dataNode.put("status", result.status);
            dataNode.put("executionTime", result.executionTime);
            
            executionLogs.append(String.format("[%s] Node %s completed with status: %s (exit code: %d, time: %dms)\n", 
                Instant.now(), nodeId, result.status, result.exitCode, result.executionTime));
            executionLogs.append(String.format("[%s] Output: %s\n", Instant.now(), 
                result.output.length() > 200 ? result.output.substring(0, 200) + "..." : result.output));
            
            logger.info("Action node execution completed with status: {}", result.status);

            // Emit: succeeded/failed
            String finalStatus = result.status.equalsIgnoreCase("SUCCESS") ? "Node succeeded." : "Node failed.";
            messagingTemplate.convertAndSend("/topic/flow-execution/" + flowId,
                Map.of("type", "node_log", "nodeId", nodeId, "log", finalStatus));
            
        } catch (Exception e) {
            logger.error("Error executing action node: {}", e.getMessage(), e);
            
            String nodeId = node.get("id").asText();
            executionLogs.append(String.format("[%s] Node %s failed: %s\n", 
                Instant.now(), nodeId, e.getMessage()));
            
            // Update node with error information
            ObjectNode dataNode = (ObjectNode) node.get("data");
            dataNode.put("code", -1);
            dataNode.put("output", "Error: " + e.getMessage());
            dataNode.put("status", "FAILED");
            dataNode.put("error", e.getMessage());
            messagingTemplate.convertAndSend("/topic/flow-execution/" + flowId,
                Map.of("type", "node_log", "nodeId", nodeId, "log", "Node failed: " + e.getMessage()));
        }
    }

    private String createCustomJob(String dockerImage, String command, String code, int timeout) {
        String jobName = "flow-action-" + System.currentTimeMillis() + "-" + (int)(Math.random() * 1000);
        
        // Determine the execution approach based on available data
        if (code != null && !code.trim().isEmpty()) {
            // Use the existing TaskService for Python code execution
            return taskService.runJob(code);
        } else {
            // Create a custom job for command execution
            return createCommandJob(jobName, dockerImage, command, timeout);
        }
    }

    private String createCommandJob(String jobName, String dockerImage, String command, int timeout) {
        try {
            // Parse command into array (handle simple commands for now)
            String[] commandArray = parseCommand(command);
            
            var job = new io.fabric8.kubernetes.api.model.batch.v1.JobBuilder()
                    .withNewMetadata()
                    .withName(jobName)
                    .endMetadata()
                    .withNewSpec()
                    .withActiveDeadlineSeconds((long) timeout)
                    .withNewTemplate()
                    .withNewMetadata()
                    .addToLabels("job", jobName)
                    .addToLabels("flow-execution", "true")
                    .endMetadata()
                    .withNewSpec()
                    .addNewContainer()
                    .withName("executor")
                    .withImage(dockerImage)
                    .withCommand(commandArray)
                    .withImagePullPolicy("IfNotPresent")
                    .endContainer()
                    .withRestartPolicy("Never")
                    .endSpec()
                    .endTemplate()
                    .endSpec()
                    .build();

            kubernetesClient.batch().v1().jobs().inNamespace(NAMESPACE).resource(job).create();
            return jobName;
            
        } catch (Exception e) {
            logger.error("Error creating custom job: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to create custom job: " + e.getMessage(), e);
        }
    }

    private String[] parseCommand(String command) {
        // Simple command parsing - split by spaces, handle quotes
        if (command == null || command.trim().isEmpty()) {
            return new String[]{"echo", "No command provided"};
        }
        
        // For simple commands, split by space
        // This is a basic implementation - for production, consider using a proper command parser
        String trimmed = command.trim();
        
        // Handle quoted arguments
        List<String> parts = new ArrayList<>();
        StringBuilder current = new StringBuilder();
        boolean inQuotes = false;
        char quoteChar = 0;
        
        for (int i = 0; i < trimmed.length(); i++) {
            char c = trimmed.charAt(i);
            
            if ((c == '"' || c == '\'') && !inQuotes) {
                inQuotes = true;
                quoteChar = c;
            } else if (c == quoteChar && inQuotes) {
                inQuotes = false;
                quoteChar = 0;
            } else if (c == ' ' && !inQuotes) {
                if (current.length() > 0) {
                    parts.add(current.toString());
                    current.setLength(0);
                }
            } else {
                current.append(c);
            }
        }
        
        if (current.length() > 0) {
            parts.add(current.toString());
        }
        
        return parts.toArray(new String[0]);
    }

    private JobExecutionResult monitorJobExecutionWithLogs(String jobName, Duration timeout, String flowId, String nodeId) {
        Instant startTime = Instant.now();
        Instant deadline = startTime.plus(timeout);
        String lastLogs = "";
        while (Instant.now().isBefore(deadline)) {
            try {
                Thread.sleep(POLL_INTERVAL.toMillis());
                Pod pod = getJobPod(jobName);
                if (pod == null) {
                    continue;
                }
                String phase = pod.getStatus() != null ? pod.getStatus().getPhase() : "unknown";
                String logs = getPodLogs(pod.getMetadata().getName());
                if (!logs.equals(lastLogs)) {
                    String newLogs = logs.substring(lastLogs.length());
                    if (!newLogs.isBlank()) {
                        messagingTemplate.convertAndSend("/topic/flow-execution/" + flowId,
                            Map.of("type", "node_log", "nodeId", nodeId, "log", newLogs));
                    }
                    lastLogs = logs;
                }
                if ("Succeeded".equalsIgnoreCase(phase)) {
                    long executionTime = Duration.between(startTime, Instant.now()).toMillis();
                    return new JobExecutionResult(0, logs, "SUCCESS", executionTime);
                }
                if ("Failed".equalsIgnoreCase(phase)) {
                    long executionTime = Duration.between(startTime, Instant.now()).toMillis();
                    return new JobExecutionResult(1, logs, "FAILED", executionTime);
                }
                if ("Running".equalsIgnoreCase(phase)) {
                    continue;
                }
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                throw new RuntimeException("Job monitoring interrupted", e);
            } catch (Exception e) {
                logger.warn("Error monitoring job {}: {}", jobName, e.getMessage());
            }
        }
        // Timeout reached
        cleanupJob(jobName);
        long executionTime = Duration.between(startTime, Instant.now()).toMillis();
        return new JobExecutionResult(-1, "Job execution timed out", "TIMEOUT", executionTime);
    }

    private Pod getJobPod(String jobName) {
        var pods = kubernetesClient.pods()
                .inNamespace(NAMESPACE)
                .withLabel("job-name", jobName)
                .list().getItems();
        
        return pods.isEmpty() ? null : pods.get(0);
    }

    private String getPodLogs(String podName) {
        try {
            return kubernetesClient.pods()
                    .inNamespace(NAMESPACE)
                    .withName(podName)
                    .getLog(true)
                    .trim();
        } catch (Exception e) {
            logger.warn("Error fetching logs for pod {}: {}", podName, e.getMessage());
            return "Error retrieving logs: " + e.getMessage();
        }
    }

    private void cleanupJob(String jobName) {
        try {
            logger.info("Cleaning up Kubernetes job: {}", jobName);
            kubernetesClient.batch().v1().jobs()
                    .inNamespace(NAMESPACE)
                    .withName(jobName)
                    .delete();
            logger.info("Job {} deleted successfully.", jobName);
        } catch (Exception e) {
            logger.warn("Failed to delete job {}: {}", jobName, e.getMessage(), e);
        }
    }

    private static class JobExecutionResult {
        private final int exitCode;
        private final String output;
        private final String status;
        private final long executionTime;

        public JobExecutionResult(int exitCode, String output, String status, long executionTime) {
            this.exitCode = exitCode;
            this.output = output;
            this.status = status;
            this.executionTime = executionTime;
        }
    }
} 