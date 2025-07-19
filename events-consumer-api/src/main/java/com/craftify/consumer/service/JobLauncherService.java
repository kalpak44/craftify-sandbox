package com.craftify.consumer.service;

import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.springframework.stereotype.Service;

@Service
public class JobLauncherService {

  private final KubernetesClient client;

  public JobLauncherService(KubernetesClient client) {
    this.client = client;
  }

  public void launchJob(String type) {
    Job job = JobDefinitions.buildJob(type);
    client.batch().v1().jobs().inNamespace("userspace").resource(job).create();
    System.out.println("Job " + type + " launched.");
  }
}
