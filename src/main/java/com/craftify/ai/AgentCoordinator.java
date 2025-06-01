package com.craftify.ai;

import com.craftify.ai.agents.api.Agent;
import com.craftify.ai.model.AgentStep;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.function.Consumer;

/**
 * Coordinates multiple agents to solve a user task through recursive planning.
 */
@Service
public class AgentCoordinator {

    private static final int MAX_DEPTH = 10;
    private final ChatClient chatClient;
    private final List<Agent> agents;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public AgentCoordinator(ChatClient chatClient, List<Agent> agents) {
        this.chatClient = chatClient;
        this.agents = agents;
    }

    /**
     * Starts handling a user prompt using available agents and streams output.
     */
    public void handleMessage(String userPrompt, Consumer<String> output) {
        String agentDescriptions = agents.stream()
                .map(agent -> {
                    String base = "- `" + agent.getId() + "`: " + agent.getDescription();
                    String notes = agent.getUsageNotes();
                    return notes.isBlank() ? base : base + "\n  " + notes.stripIndent();
                })
                .reduce((a, b) -> a + "\n" + b)
                .orElse("No available agents.");

        runRecursivePlan(userPrompt, new ArrayList<>(), 0, agentDescriptions, output);
    }

    /**
     * Recursively plans and executes steps using agents until task is complete or depth limit is hit.
     */
    private void runRecursivePlan(String userPrompt,
                                  List<String> previousResults,
                                  int depth,
                                  String agentDescriptions,
                                  Consumer<String> output) {
        if (depth >= MAX_DEPTH) {
            output.accept("⛔ Maximum step limit of " + MAX_DEPTH + " reached.");
            output.accept("[END]");
            return;
        }

        if (checkIfTaskComplete(userPrompt, previousResults)) {
            output.accept("✅ Task is complete.");
            output.accept("[END]");
        }

        StringBuilder fullContext = new StringBuilder();
        if (!previousResults.isEmpty()) {
            fullContext.append("Output from previous steps:\n");
            for (int i = 0; i < previousResults.size(); i++) {
                fullContext.append("Step ").append(i + 1).append(":\n");
                fullContext.append(previousResults.get(i)).append("\n\n");
            }
        }

        String planningPrompt = """
                You have access to the following agents:
                
                %s
                
                User's original task:
                %s
                
                %s
                
                Planning instructions:
                - If the user's task is complete, return JSON: { "agentId": "", "input": "" }
                - If a next step is required, return it as JSON:
                  {
                    "agentId": "agent-id",
                    "input": "input to provide to that agent"
                  }
                
                Return ONLY valid JSON. No explanations. No markdown.
                """.formatted(agentDescriptions, userPrompt, fullContext.toString());

        chatClient.prompt()
                .user(planningPrompt)
                .stream()
                .content()
                .collectList()
                .map(chunks -> String.join("", chunks).trim())
                .doOnNext(json -> {
                    try {
                        AgentStep step = objectMapper.readValue(json, AgentStep.class);
                        if (step.agentId() == null || step.agentId().isBlank()) {
                            output.accept("✅ Task is complete.");
                            output.accept("[END]");
                            return;
                        }

                        Agent agent = findAgentById(step.agentId());
                        if (agent != null) {
                            output.accept("➡️ Step " + (depth + 1) + ": `" + step.agentId() + "`\n");
                            String result = agent.handle(step.input());
                            output.accept(result + "\n");

                            if (checkIfTaskComplete(userPrompt, previousResults)) {
                                output.accept("✅ Task is complete.");
                                output.accept("[END]");
                            } else {
                                previousResults.add(result);
                                runRecursivePlan(userPrompt, previousResults, depth + 1, agentDescriptions, output);
                            }
                        } else {
                            output.accept("⚠️ Agent with ID `" + step.agentId() + "` not found.");
                            output.accept("[END]");
                        }
                    } catch (Exception e) {
                        output.accept("✅ Task ended or invalid plan format: " + e.getMessage());
                        output.accept("[END]");
                    }
                })
                .subscribe();
    }

    /**
     * Checks whether the task is complete using model feedback.
     */
    private boolean checkIfTaskComplete(String userTask, List<String> stepOutputs) {
        StringBuilder promptBuilder = new StringBuilder();
        promptBuilder.append("User's original task:\n")
                .append(userTask)
                .append("\n\n");

        if (!stepOutputs.isEmpty()) {
            String lastStepOutput = stepOutputs.get(stepOutputs.size() - 1);
            promptBuilder.append("Output from the most recent step:\n")
                    .append(lastStepOutput)
                    .append("\n\n");
        } else {
            return false;
        }

        String completionCheckPrompt = """
                %s
                
                Based on this information, answer the following:
                
                Has the user's original task been fully completed?
                Respond with exactly one word: "true" or "false".
                """.formatted(promptBuilder.toString());

        String modelReply = chatClient.prompt()
                .user(completionCheckPrompt)
                .stream()
                .content()
                .collectList()
                .map(parts -> String.join("", parts).trim().toLowerCase())
                .block();

        return "true".equals(modelReply);
    }

    /**
     * Finds an agent by ID.
     */
    private Agent findAgentById(String id) {
        return agents.stream()
                .filter(agent -> agent.getId().equalsIgnoreCase(id))
                .findFirst()
                .orElse(null);
    }
}
