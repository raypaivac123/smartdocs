package com.smartdocs.config;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import com.fasterxml.jackson.datatype.jsr310.JavaTimeModule;
import io.swagger.v3.oas.models.*;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.*;
import org.springframework.boot.web.client.ClientHttpRequestFactorySettings;
import org.springframework.boot.web.client.ClientHttpRequestFactories;
import org.springframework.context.annotation.*;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

@Configuration
@EnableAsync
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        // A hung AI provider call blocks the RabbitMQ listener thread forever, since
        // Spring AMQP's retry only kicks in once an exception is thrown. Without an
        // explicit timeout here, an unreachable/slow provider defeats the DLQ/retry
        // resilience entirely instead of triggering it.
        var settings = ClientHttpRequestFactorySettings.DEFAULTS
                .withConnectTimeout(Duration.ofSeconds(5))
                .withReadTimeout(Duration.ofSeconds(20));
        return new RestTemplate(ClientHttpRequestFactories.get(settings));
    }

    @Bean
    public ExecutorService documentProcessingExecutor() {
        // PDFBox parsing has no built-in timeout, unlike the RestTemplate above - a
        // pathological PDF (e.g. deeply nested objects, decompression bomb) can hang
        // the parser indefinitely. Running it on a virtual thread lets DocumentService
        // bound the whole extraction+analysis step with Future#get(timeout), so a
        // stuck document times out instead of blocking the RabbitMQ consumer forever.
        return Executors.newVirtualThreadPerTaskExecutor();
    }

    @Bean
    @Primary
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                .registerModule(new JavaTimeModule())
                .disable(SerializationFeature.WRITE_DATES_AS_TIMESTAMPS);
    }

    @Bean
    public OpenAPI openAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("SmartDocs API")
                        .description("AI Document Intelligence Platform")
                        .version("1.0.0"))
                .addSecurityItem(new SecurityRequirement().addList("Bearer"))
                .components(new Components().addSecuritySchemes("Bearer",
                        new SecurityScheme()
                                .type(SecurityScheme.Type.HTTP)
                                .scheme("bearer")
                                .bearerFormat("JWT")));
    }
}