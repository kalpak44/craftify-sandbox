package com.craftify.config;

import io.minio.MinioClient;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class for initializing and providing a MinIO client bean. This class loads
 * MinIO-related properties from application configuration using the prefix {@code minio}, and
 * constructs a {@link MinioClient} bean that can be injected wherever needed.
 */
@Configuration
@ConfigurationProperties(prefix = "minio")
public class MinioClientConfig {

  /** The URL of the MinIO server. */
  private String url;

  /** The access key for authenticating with MinIO. */
  private String accessKey;

  /** The secret key for authenticating with MinIO. */
  private String secretKey;

  /** The name of the default bucket to be used. */
  private String bucket;

  public String getUrl() {
    return url;
  }

  public void setUrl(String url) {
    this.url = url;
  }

  public String getAccessKey() {
    return accessKey;
  }

  public void setAccessKey(String accessKey) {
    this.accessKey = accessKey;
  }

  public String getSecretKey() {
    return secretKey;
  }

  public void setSecretKey(String secretKey) {
    this.secretKey = secretKey;
  }

  public String getBucket() {
    return bucket;
  }

  public void setBucket(String bucket) {
    this.bucket = bucket;
  }

  /**
   * Creates and returns a {@link MinioClient} bean using the configured URL and credentials.
   *
   * @return a configured {@link MinioClient} instance
   */
  @Bean
  public MinioClient minioClient() {
    return MinioClient.builder().endpoint(url).credentials(accessKey, secretKey).build();
  }
}
