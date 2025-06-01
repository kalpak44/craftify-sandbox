package com.craftify.service;

import io.fabric8.kubernetes.api.model.EnvVar;
import io.fabric8.kubernetes.api.model.batch.v1.JobBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
public class TaskService {

    private final KubernetesClient client;

    public TaskService(KubernetesClient client) {
        this.client = client;
    }

    public String runJob(String code) {
        String jobName = "chat-task-" + UUID.randomUUID().toString().substring(0, 8);

        var job =
                new JobBuilder()
                        .withNewMetadata()
                        .withName(jobName)
                        .endMetadata()
                        .withNewSpec()
                        .withNewTemplate()
                        .withNewMetadata()
                        .addToLabels("job", jobName)
                        .endMetadata()
                        .withNewSpec()
                        .addNewContainer()
                        .withName("runner")
                        .withImage("kalpak44/job-runner:latest")
                        .withEnv(List.of(new EnvVar("TASK_CODE", code, null)))
                        .withImagePullPolicy("IfNotPresent")
                        .endContainer()
                        .withRestartPolicy("Never")
                        .endSpec()
                        .endTemplate()
                        .endSpec()
                        .build();

        client.batch().v1().jobs().inNamespace("default").resource(job).create();
        return jobName;
    }
}
