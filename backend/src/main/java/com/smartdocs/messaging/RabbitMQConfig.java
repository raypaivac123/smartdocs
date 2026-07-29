package com.smartdocs.messaging;

import org.springframework.amqp.core.Binding;
import org.springframework.amqp.core.BindingBuilder;
import org.springframework.amqp.core.DirectExchange;
import org.springframework.amqp.core.Queue;
import org.springframework.amqp.core.QueueBuilder;
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

    @Value("${smartdocs.rabbitmq.dlx-exchange}")
    private String dlxExchangeName;

    @Value("${smartdocs.rabbitmq.dlq}")
    private String dlqName;

    @Value("${smartdocs.rabbitmq.dlq-routing-key}")
    private String dlqRoutingKey;

    @Bean
    public DirectExchange documentExchange() {
        return new DirectExchange(exchangeName);
    }

    @Bean
    public Queue documentProcessingQueue() {
        return QueueBuilder.durable(queueName)
                .withArgument("x-dead-letter-exchange", dlxExchangeName)
                .withArgument("x-dead-letter-routing-key", dlqRoutingKey)
                .build();
    }

    @Bean
    public Binding documentProcessingBinding() {
        return BindingBuilder
                .bind(documentProcessingQueue())
                .to(documentExchange())
                .with(routingKey);
    }

    @Bean
    public DirectExchange documentDeadLetterExchange() {
        return new DirectExchange(dlxExchangeName);
    }

    @Bean
    public Queue documentProcessingDlq() {
        return QueueBuilder.durable(dlqName).build();
    }

    @Bean
    public Binding documentDeadLetterBinding() {
        return BindingBuilder
                .bind(documentProcessingDlq())
                .to(documentDeadLetterExchange())
                .with(dlqRoutingKey);
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }
}