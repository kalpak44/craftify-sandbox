package com.craftify.chat;

import com.craftify.ai.AgentCoordinator;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

/**
 * WebSocket controller that listens for incoming user messages
 * and streams AI-generated responses back to the client.
 */
@Controller
public class ChatController {

    private final AgentCoordinator agentCoordinator;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Constructs the chat controller with dependencies for AI coordination and message broadcasting.
     *
     * @param agentCoordinator   coordinates AI message handling
     * @param messagingTemplate  sends messages to subscribed clients
     */
    public ChatController(AgentCoordinator agentCoordinator, SimpMessagingTemplate messagingTemplate) {
        this.agentCoordinator = agentCoordinator;
        this.messagingTemplate = messagingTemplate;
    }

    /**
     * Handles incoming messages from the user and sends AI-generated replies
     * to the "/topic/messages" WebSocket destination.
     *
     * @param userInput the user's message content
     */
    @MessageMapping("/chat")
    public void handleChatCommand(String userInput) {
        agentCoordinator.handleMessage(userInput,
                fragment -> messagingTemplate.convertAndSend("/topic/messages", fragment));
    }
}
