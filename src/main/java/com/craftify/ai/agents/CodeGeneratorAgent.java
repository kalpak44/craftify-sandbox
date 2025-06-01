package com.craftify.ai.agents;

import com.craftify.ai.agents.api.Agent;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Agent that generates raw, executable Python code from a natural language task.
 */
@Component
public class CodeGeneratorAgent implements Agent {

    private final ChatClient chatClient;

    public CodeGeneratorAgent(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String getId() {
        return "code-generator";
    }

    @Override
    public String getDescription() {
        return "Generates Python code from a natural language task.";
    }

    @Override
    public String getUsageNotes() {
        return """
                🛠️ Usage notes for `code-generator`:
                - Output is raw Python code, no Markdown or comments.
                - Input should be a clear task description.
                """;
    }

    @Override
    public String handle(String input) {
        String prompt = """
                Generate valid and executable Python code that satisfies the task described below.
                
                ⚠️ Rules:
                - The output must be properly formatted and syntactically correct Python code.
                - Do NOT include any Markdown formatting (no ```python).
                - Do NOT include explanations, comments, or extra text — just the raw code.
                
                Task: %s
                """.formatted(input);

        List<String> response = chatClient
                .prompt()
                .user(prompt)
                .stream()
                .content()
                .collectList()
                .block();

        if (response == null || response.isEmpty()) {
            return "⚠️ Failed to receive code from the model.";
        }

        return String.join("\n", response).trim();
    }
}
