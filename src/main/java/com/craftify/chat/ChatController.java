package com.craftify.chat;

import com.craftify.ai.AgentCoordinator;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * Handles incoming chat messages and routes responses from the AI agent.
 */
@Controller
public class ChatController {

    private final AgentCoordinator agentCoordinator;
    private final SimpMessagingTemplate messagingTemplate;

    public ChatController(AgentCoordinator agentCoordinator, SimpMessagingTemplate messagingTemplate) {
        this.agentCoordinator = agentCoordinator;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Receives user input from the /chat endpoint and sends back agent responses to /topic/messages.
     */
    @MessageMapping("/chat")
    public void handleChatCommand(String userInput) {
        agentCoordinator.handleMessage(userInput,
                fragment -> messagingTemplate.convertAndSend("/topic/messages", fragment));
    }
}
