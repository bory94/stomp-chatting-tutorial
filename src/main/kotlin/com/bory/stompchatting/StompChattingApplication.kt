package com.bory.stompchatting

import org.springframework.boot.autoconfigure.SpringBootApplication
import org.springframework.boot.context.properties.ConfigurationPropertiesScan
import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.boot.runApplication

@ConfigurationPropertiesScan
@EnableConfigurationProperties
@SpringBootApplication
class StompChattingApplication

fun main(args: Array<String>) {
    runApplication<StompChattingApplication>(*args)
}
