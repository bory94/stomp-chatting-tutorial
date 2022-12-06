package com.bory.stompchatting.config.properties

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.ConstructorBinding

@ConstructorBinding
@ConfigurationProperties("chat-app")
data class ChatAppProperties(
    val endpoint: String,
    val relayHost: String,
    val relayPort: Int,
    val clientLogin: String,
    val clientPasscode: String
)