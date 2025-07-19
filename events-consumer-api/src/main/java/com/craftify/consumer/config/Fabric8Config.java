package com.craftify.consumer.config;

import io.fabric8.kubernetes.client.Config;
import io.fabric8.kubernetes.client.ConfigBuilder;
import io.fabric8.kubernetes.client.KubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClientBuilder;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for setting up the Fabric8 Kubernetes client. Loads properties prefixed with
 * "kubernetes" from the application configuration.
 */
@Configuration
@ConfigurationProperties(prefix = "kubernetes")
public class Fabric8Config {

  private static final Logger logger = LoggerFactory.getLogger(Fabric8Config.class);

  private String masterUrl;
  private boolean trustCerts;

  public String getMasterUrl() {
    return masterUrl;
  }

  public void setMasterUrl(String masterUrl) {
    this.masterUrl = masterUrl;
  }

  public boolean isTrustCerts() {
    return trustCerts;
  }

  public void setTrustCerts(boolean trustCerts) {
    this.trustCerts = trustCerts;
  }

  @Bean(destroyMethod = "close")
  public KubernetesClient kubernetesClient() {
    Config config;

    if (masterUrl != null && !masterUrl.isBlank()) {
      logger.info("Using explicit Fabric8 master URL: {}", masterUrl);
      config = new ConfigBuilder().withMasterUrl(masterUrl).withTrustCerts(trustCerts).build();
    } else {
      logger.info("Using in-cluster Kubernetes config (default)");
      config = Config.autoConfigure(null);
    }

    return new KubernetesClientBuilder().withConfig(config).build();
  }
}
