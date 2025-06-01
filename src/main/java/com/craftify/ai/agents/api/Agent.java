package com.craftify.ai.agents.api;

/**
 * A modular AI agent that can handle tasks.
 */
public interface Agent {

    /**
     * Returns the agent's unique ID (e.g., "code-generator").
     */
    String getId();

    /**
     * Returns a short description of what the agent does.
     */
    String getDescription();

    /**
     * Returns usage notes for the agent.
     */
    String getUsageNotes();

    /**
     * Processes the input and returns a result.
     */
    String handle(String input);
}
