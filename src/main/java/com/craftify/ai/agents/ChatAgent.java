package com.craftify.ai.agents;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Service;

import java.util.function.Consumer;

/**
 * A basic agent that streams chat responses from the model.
 */
@Service
public class ChatAgent {

    private final ChatClient chatClient;

    public ChatAgent(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Sends a message to the model and streams back the response.
     *
     * @param message user input
     * @param output  consumer for streamed content
     */
    public void handle(String message, Consumer<String> output) {
        chatClient.prompt()
                .user(message)
                .stream()
                .content()
                .doOnNext(output)
                .doOnComplete(() -> output.accept("[END]"))
                .subscribe();
    }
}
