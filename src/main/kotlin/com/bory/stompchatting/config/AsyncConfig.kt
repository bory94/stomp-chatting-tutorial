package com.bory.stompchatting.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.scheduling.annotation.EnableAsync
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor

@EnableAsync
@Configuration
class AsyncConfig {
    @Bean(destroyMethod = "shutdown")
    fun defaultThreadExecutor() = ThreadPoolTaskExecutor().apply {
        corePoolSize = 20
        maxPoolSize = 40
    }
}