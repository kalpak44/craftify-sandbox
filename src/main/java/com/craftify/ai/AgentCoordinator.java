package com.craftify.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.stereotype.Component;
import reactor.core.publisher.Mono;

import java.util.function.Consumer;

/**
 * Coordinates interactions between the user and the AI-powered {@link ChatClient}.
 * Streams response content back to the caller chunk by chunk and signals completion.
 */
@Component
public class AgentCoordinator {

    private final ChatClient chatClient;

    /**
     * Constructs an AgentCoordinator with the provided chat client.
     *
     * @param chatClient the AI chat client used to process user inputs
     */
    public AgentCoordinator(ChatClient chatClient) {
        this.chatClient = chatClient;
    }

    /**
     * Processes user input using the AI chat client and streams the output to the given callback.
     * After all output chunks are streamed, an "[END]" marker is sent to indicate completion.
     *
     * @param userInput the user's prompt to process
     * @param callback  a consumer to receive streamed response chunks
     */
    public void handleMessage(String userInput, Consumer<String> callback) {
        chatClient.prompt()
                .user(userInput)
                .stream()
                .content()
                .collectList()
                .map(chunks -> String.join("", chunks).replaceAll("\\s+", " ").trim())
                .doOnNext(callback)
                .thenReturn("[END]")
                .subscribe();

    }
}
