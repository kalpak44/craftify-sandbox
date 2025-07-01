package com.craftify.config;

import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@Configuration
@EnableConfigurationProperties(KubernetesConfig.class)
public class Fabric8Config {

  private static final Logger logger = LoggerFactory.getLogger(Fabric8Config.class);

  private final KubernetesConfig kubernetesConfig;

  public Fabric8Config(KubernetesConfig kubernetesConfig) {
    this.kubernetesConfig = kubernetesConfig;
  }

  @Bean(destroyMethod = "close")
  public KubernetesClient kubernetesClient() {
    logger.info("Initializing Fabric8 KubernetesClient for {}...", kubernetesConfig.getMasterUrl());

    // Config from YAML
    var config =
        new ConfigBuilder().withMasterUrl(kubernetesConfig.getMasterUrl()).withTrustCerts(kubernetesConfig.isTrustCerts()).build();

    return new KubernetesClientBuilder().withConfig(config).build();
  }
}
