package com.smartdocs.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    @Value("${smartdocs.rabbitmq.exchange}")
    private String exchangeName;

    @Value("${smartdocs.rabbitmq.queue}")
    private String queueName;

    @Value("${smartdocs.rabbitmq.routing-key}")
    private String routingKey;

    @Bean
    public DirectExchange documentExchange() {
        return new DirectExchange(exchangeName);
    }

    @Bean
    public Queue documentProcessingQueue() {
        return new Queue(queueName, true);
    }

    @Bean
    public Binding documentProcessingBinding() {
        return BindingBuilder
                .bind(documentProcessingQueue())
                .to(documentExchange())
                .with(routingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}