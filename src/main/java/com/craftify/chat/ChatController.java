package com.craftify.chat;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

@Controller
public class ChatController {

  private final ChatClient chatClient;
  private final SimpMessagingTemplate messagingTemplate;

  public ChatController(ChatClient chatClient, SimpMessagingTemplate messagingTemplate) {
    this.chatClient = chatClient;
    this.messagingTemplate = messagingTemplate;
  }

  @MessageMapping("/chat")
  public void streamChatResponse(String userInput) {
    Flux<String> responseFlux = chatClient.prompt().user(userInput).stream().content();

    responseFlux
        .doOnNext(fragment -> messagingTemplate.convertAndSend("/topic/messages", fragment))
        .doOnComplete(() -> messagingTemplate.convertAndSend("/topic/messages", "[END]"))
        .subscribe();
  }
}
