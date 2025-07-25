package com.craftify.bff.config;

import java.nio.file.Path;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.context.annotation.Configuration;

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
