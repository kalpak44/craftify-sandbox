package com.craftify.consumer.service;

import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;

public class JobDefinitions {

  public static Job buildJob(String name, String command) {
    return new JobBuilder()
        .withNewMetadata()
        .withGenerateName(name + "-")
        .endMetadata()
        .withNewSpec()
        .withTtlSecondsAfterFinished(60)
        .withNewTemplate()
        .withNewSpec()
        .withRestartPolicy("Never")
        .addNewContainer()
        .withName(name)
        .withImage("curlimages/curl:latest")
        .withCommand("sh", "-c", command)
        .endContainer()
        .endSpec()
        .endTemplate()
        .endSpec()
        .build();
  }
}
