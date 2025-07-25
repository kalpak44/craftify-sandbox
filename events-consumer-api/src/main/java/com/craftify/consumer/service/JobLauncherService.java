package com.craftify.consumer.service;

import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.springframework.stereotype.Service;

@Service
public class JobLauncherService {

  private final KubernetesClient client;
  private final EventTypeRegistry eventTypeRegistry;

  public JobLauncherService(KubernetesClient client, EventTypeRegistry eventTypeRegistry) {
    this.client = client;
    this.eventTypeRegistry = eventTypeRegistry;
  }

  public void launchJob(String type, String payload) {
    String shellCommand = eventTypeRegistry.executionLogic(type, payload);
    Job job = JobDefinitions.buildJob("form-submit-handler", shellCommand);
    client.batch().v1().jobs().inNamespace("userspace").resource(job).create();
    System.out.println("Job launched for type: " + type);
  }
}
