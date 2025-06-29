package com.craftify.flows;

import com.craftify.common.exception.ServerException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.node.ObjectNode;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

@Service
public class FlowExecutionService {

    private static final Logger logger = LoggerFactory.getLogger(FlowExecutionService.class);
    private final ObjectMapper objectMapper;

    public FlowExecutionService(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    public Flow executeFlow(Flow flow) {
        logger.info("Starting execution of flow: {}", flow.getName());

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
                traverseAndUpdate(root, nodeMap, graph, visited);
            }

            // Return updated config as JSON string
            String updatedConfigJson = objectMapper.writeValueAsString(config);
            flow.setConfiguration(updatedConfigJson);
            return flow;

        } catch (Exception e) {
            logger.error("Error executing flow: {}", e.getMessage(), e);
            throw new ServerException("Error executing flow: %s".formatted(e.getMessage()));

        }
    }

    private void traverseAndUpdate(String nodeId,
                                   Map<String, JsonNode> nodeMap,
                                   Map<String, List<String>> graph,
                                   Set<String> visited) {
        if (visited.contains(nodeId)) return;
        visited.add(nodeId);

        JsonNode node = nodeMap.get(nodeId);
        if (node != null && "action".equals(node.get("type").asText())) {
            ObjectNode data = node.withObject("data");
            data.put("code", 0);
            data.put("output", "Hardcoded log");
        }

        List<String> children = graph.getOrDefault(nodeId, List.of());
        for (String childId : children) {
            traverseAndUpdate(childId, nodeMap, graph, visited);
        }
    }


} 