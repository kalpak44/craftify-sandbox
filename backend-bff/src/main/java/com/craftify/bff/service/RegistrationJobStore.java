package com.craftify.bff.service;

import com.craftify.bff.model.RegistrationJob;
import org.springframework.stereotype.Component;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class RegistrationJobStore {
    private final Map<String, RegistrationJob> jobs = new ConcurrentHashMap<>();

    public RegistrationJob create(String id) {
        var job = new RegistrationJob(id);
        jobs.put(id, job);
        return job;
    }

    public RegistrationJob get(String id) {
        return jobs.get(id);
    }
}