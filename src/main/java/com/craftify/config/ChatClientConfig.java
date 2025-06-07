package com.craftify.config;

import com.craftify.ai.tools.JobRunnerTool;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for setting up the {@link ChatClient} bean with default tools.
 * Integrates custom AI tools into the Spring AI chat client.
 */
@Configuration
public class ChatClientConfig {

    /**
     * Creates and configures a {@link ChatClient} bean using the provided chat model and tools.
     *
     * @param tool      The {@link JobRunnerTool} to be registered as a default tool.
     * @param chatModel The chat model to be used for AI interactions.
     * @return A configured {@link ChatClient} instance.
     */
    @Bean
    public ChatClient chatClient(JobRunnerTool tool, ChatModel chatModel) {
        return ChatClient.builder(chatModel)
                .defaultTools(tool)
                .build();
    }
}
