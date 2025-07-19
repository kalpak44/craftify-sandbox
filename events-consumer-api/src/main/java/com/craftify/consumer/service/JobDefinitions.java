package com.craftify.consumer.service;

import io.fabric8.kubernetes.api.model.batch.v1.Job;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;

public class JobDefinitions {

  public static Job buildJob(String name) {
    String script =
        switch (name) {
          case "handler-a" -> "echo Handling EVENT_A && sleep 3";
          case "handler-b" -> "echo Handling EVENT_B && sleep 3";
          default -> "echo Unknown job && sleep 1";
        };

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
        .withImage("busybox:1.35")
        .withCommand("sh", "-c", script)
        .endContainer()
        .endSpec()
        .endTemplate()
        .endSpec()
        .build();
  }
}
