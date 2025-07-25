package com.craftify.bff.model;

import com.craftify.bff.dto.LogEvent;
import java.time.Instant;
import java.util.List;
import java.util.concurrent.CopyOnWriteArrayList;

public class RegistrationJob {
  public final String id;
  public final List<LogEvent> logs = new CopyOnWriteArrayList<>();
  public volatile String status = "in-progress"; // or "success", "error"
  public volatile String error = null;
  public final Instant started = Instant.now();

  public RegistrationJob(String id) {
    this.id = id;
  }
}
