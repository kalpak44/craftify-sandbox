package com.craftify.chat;

import com.craftify.service.TaskService;
import io.fabric8.kubernetes.client.KubernetesClient;
import java.time.Duration;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;
import reactor.core.publisher.Flux;

@Controller
public class ChatController {

  private final ChatClient chatClient;
  private final SimpMessagingTemplate messagingTemplate;
  private final TaskService taskService;
  private final KubernetesClient k8sClient;

  public ChatController(
      ChatClient chatClient,
      SimpMessagingTemplate messagingTemplate,
      TaskService taskService,
      KubernetesClient k8sClient) {
    this.chatClient = chatClient;
    this.messagingTemplate = messagingTemplate;
    this.taskService = taskService;
    this.k8sClient = k8sClient;
  }

  @MessageMapping("/chat")
  public void handleChatCommand(String userInput) {
    if (userInput.startsWith("code:")) {
      String code = userInput.replaceFirst("code:", "").trim();
      String jobName = taskService.runJob(code);

      Flux.interval(Duration.ofSeconds(2))
          .take(60) // up to 2 mins
          .flatMap(
              i -> {
                var pod =
                    k8sClient
                        .pods()
                        .inNamespace("default")
                        .withLabel("job", jobName)
                        .list()
                        .getItems()
                        .stream()
                        .findFirst();

                if (pod.isPresent()) {
                  var log =
                      k8sClient
                          .pods()
                          .inNamespace("default")
                          .withName(pod.get().getMetadata().getName())
                          .getLog();
                  return Flux.just(log);
                } else {
                  return Flux.just("⌛ Ожидание запуска пода...");
                }
              })
          .distinctUntilChanged()
          .doOnNext(log -> messagingTemplate.convertAndSend("/topic/messages", log))
          .doOnComplete(() -> messagingTemplate.convertAndSend("/topic/messages", "[END]"))
          .subscribe();
    } else {
      // обычный AI ответ
      Flux<String> response = chatClient.prompt().user(userInput).stream().content();
      response
          .doOnNext(fragment -> messagingTemplate.convertAndSend("/topic/messages", fragment))
          .doOnComplete(() -> messagingTemplate.convertAndSend("/topic/messages", "[END]"))
          .subscribe();
    }
  }
}
