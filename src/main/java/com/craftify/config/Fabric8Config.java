package com.craftify.config;

import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Fabric8Config {

  private static final Logger logger = LoggerFactory.getLogger(Fabric8Config.class);

  @Bean(destroyMethod = "close")
  public KubernetesClient kubernetesClient() {
    logger.info("Initializing Fabric8 KubernetesClient for localhost...");

    // Explicit config for local Docker Desktop
    var config =
        new ConfigBuilder().withMasterUrl("https://localhost:6443").withTrustCerts(true).build();

    return new KubernetesClientBuilder().withConfig(config).build();
  }
}
