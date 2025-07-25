package com.craftify.bff.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.net.http.HttpClient;

import static java.net.http.HttpClient.Version.HTTP_1_1;

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

