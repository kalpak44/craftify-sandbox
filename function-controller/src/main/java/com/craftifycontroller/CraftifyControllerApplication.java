package com.craftifycontroller;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

import static java.time.ZoneOffset.UTC;

@SpringBootApplication
public class CraftifyControllerApplication {

    public static void main(String[] args) {
        // Set the default time zone to UTC.
        TimeZone.setDefault(TimeZone.getTimeZone(UTC));

        // Start the Spring Boot application.
        SpringApplication.run(CraftifyControllerApplication.class, args);
    }
}
