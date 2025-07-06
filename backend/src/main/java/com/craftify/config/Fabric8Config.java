package com.craftify.config;

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

  /**
   * Returns the Kubernetes master URL defined in the configuration.
   *
   * @return the master URL
   */
  public String getMasterUrl() {
    return masterUrl;
  }

  /**
   * Sets the Kubernetes master URL from configuration.
   *
   * @param masterUrl the master URL to connect to
   */
  public void setMasterUrl(String masterUrl) {
    this.masterUrl = masterUrl;
  }

  /**
   * Indicates whether to trust self-signed certificates when connecting to the cluster.
   *
   * @return true if certificates should be trusted, false otherwise
   */
  public boolean isTrustCerts() {
    return trustCerts;
  }

  /**
   * Sets whether to trust self-signed certificates.
   *
   * @param trustCerts boolean flag to trust certificates
   */
  public void setTrustCerts(boolean trustCerts) {
    this.trustCerts = trustCerts;
  }

  /**
   * Creates and provides a configured {@link KubernetesClient} bean using Fabric8. Automatically
   * closes the client when the Spring context is shut down.
   *
   * @return a KubernetesClient instance
   */
  @Bean(destroyMethod = "close")
  public KubernetesClient kubernetesClient() {
    logger.info("Initializing Fabric8 KubernetesClient for {}...", masterUrl);

    var config =
        new ConfigBuilder().withMasterUrl(masterUrl).withTrustCerts(isTrustCerts()).build();

    return new KubernetesClientBuilder().withConfig(config).build();
  }
}
