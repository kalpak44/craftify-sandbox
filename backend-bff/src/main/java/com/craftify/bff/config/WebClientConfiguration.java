package com.craftify.bff.config;

import static java.net.http.HttpClient.Version.HTTP_1_1;

import java.net.http.HttpClient;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class WebClientConfiguration {

  /**
   * HTTP client bean.
   *
   * @return HTTP client.
   */
  @Bean
  public HttpClient getHttpClient() {
    return HttpClient.newBuilder().version(HTTP_1_1).build();
  }
}
