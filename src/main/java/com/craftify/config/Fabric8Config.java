package com.craftify.config;

import io.fabric8.kubernetes.client.DefaultKubernetesClient;
import io.fabric8.kubernetes.client.KubernetesClient;
// import io.fabric8.kubernetes.client.Config; // Example for ConfigBuilder
// import io.fabric8.kubernetes.client.ConfigBuilder; // Example for ConfigBuilder
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Fabric8Config {

    private static final Logger logger = LoggerFactory.getLogger(Fabric8Config.class);

    @Bean(destroyMethod = "close")
    public KubernetesClient kubernetesClient() {
        logger.info("Initializing Fabric8 KubernetesClient...");
        // This will attempt to auto-configure based on environment:
        // 1. System properties (e.g., kubernetes.master)
        // 2. Environment variables (e.g., KUBERNETES_MASTER)
        // 3. Kubernetes configuration file (e.g., ~/.kube/config)
        // 4. Service account token and mounted CA certificate (if running in-cluster)

        // For specific configurations, you could use ConfigBuilder:
        // Example:
        // Config config = new ConfigBuilder()
        //     .withMasterUrl("https://your_kubernetes_api_server_url")
        //     // .withCaCertFile("/path/to/ca.crt")
        //     // .withClientKeyFile("/path/to/client.key")
        //     // .withClientCertFile("/path/to/client.crt")
        //     // .withOauthToken("your_oauth_token")
        //     // .withUsername("your_username")
        //     // .withPassword("your_password")
        //     .build();
        // return new DefaultKubernetesClient(config);

        return new DefaultKubernetesClient();
    }
}
