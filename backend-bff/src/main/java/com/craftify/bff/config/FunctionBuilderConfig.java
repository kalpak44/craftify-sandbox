package com.craftify.bff.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

import java.nio.file.Path;

@ConfigurationProperties(prefix = "function-builder")
@Configuration
public class FunctionBuilderConfig {
    private Path tempPath;
    private Path templatePath;

    public Path getTempPath() {
        return tempPath;
    }

    public void setTempPath(Path tempPath) {
        this.tempPath = tempPath;
    }

    public Path getTemplatePath() {
        return templatePath;
    }

    public void setTemplatePath(Path templatePath) {
        this.templatePath = templatePath;
    }
}
