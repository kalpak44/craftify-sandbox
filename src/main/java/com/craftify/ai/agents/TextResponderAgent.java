package com.craftify.ai.agents;

import com.craftify.ai.agents.api.Agent;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * Agent that responds with plain text using the chat model.
 */
@Component
public class TextResponderAgent implements Agent {

    private final ChatClient chatClient;

    public TextResponderAgent(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    @Override
    public String getId() {
        return "text-responder";
    }

    @Override
    public String getDescription() {
        return "Answers general questions with natural language responses. No code execution involved.";
    }

    @Override
    public String getUsageNotes() {
        return """
                🗒️ Usage notes for `text-responder`:
                - Use for plain-language queries where no code is expected.
                - Suitable for FAQs, instructions, or conversational answers.
                """;
    }

    @Override
    public String handle(String input) {
        List<String> response = chatClient.prompt()
                .user(input)
                .stream()
                .content()
                .collectList()
                .block();

        if (response == null || response.isEmpty()) {
            return "⚠️ No response from model.";
        }

        return String.join("", response).trim();
    }
}
