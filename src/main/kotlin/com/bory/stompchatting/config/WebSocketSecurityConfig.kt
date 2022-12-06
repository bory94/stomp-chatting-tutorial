package com.bory.stompchatting.config

import org.springframework.context.annotation.Configuration
import org.springframework.messaging.simp.SimpMessageType
import org.springframework.security.config.annotation.web.messaging.MessageSecurityMetadataSourceRegistry
import org.springframework.security.config.annotation.web.socket.AbstractSecurityWebSocketMessageBrokerConfigurer

@Configuration
class WebSocketSecurityConfig : AbstractSecurityWebSocketMessageBrokerConfigurer() {
    override fun configureInbound(messages: MessageSecurityMetadataSourceRegistry) {
        messages
            .simpTypeMatchers(
                SimpMessageType.CONNECT,
                SimpMessageType.DISCONNECT,
                SimpMessageType.HEARTBEAT,
                SimpMessageType.UNSUBSCRIBE,
                SimpMessageType.OTHER
            ).permitAll()
            .anyMessage().authenticated()
            .simpDestMatchers("/**").authenticated()
    }

    override fun sameOriginDisabled(): Boolean = true
}