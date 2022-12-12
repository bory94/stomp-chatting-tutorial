package com.bory.stompchatting.config

import com.bory.stompchatting.controller.AuthInfo
import org.springframework.messaging.Message
import org.springframework.messaging.MessageChannel
import org.springframework.messaging.simp.stomp.StompCommand
import org.springframework.messaging.simp.stomp.StompHeaderAccessor
import org.springframework.messaging.support.ChannelInterceptor
import org.springframework.messaging.support.MessageHeaderAccessor
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.stereotype.Component

@Component
class AuthChannelInterceptorAdapter(
) : ChannelInterceptor {
    companion object {
        private const val TOKEN: String = "__TOKEN__"
    }

    override fun preSend(message: Message<*>, channel: MessageChannel): Message<*>? {
        val accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor::class.java)
        if (StompCommand.CONNECT == accessor!!.command) {
            val tokenHeader = accessor.getFirstNativeHeader(TOKEN)
                ?: throw BadCredentialsException("$TOKEN is null")
            val token = tokenHeader.ifBlank { throw BadCredentialsException("$TOKEN is blank") }

            val authInfo = AuthInfo.parseToken(token)
            // Token validation and authentication processes are omitted
            val authorities =
                if (authInfo.username.uppercase().contains("ADMIN"))
                    listOf(GrantedAuthority { "USER" }, GrantedAuthority { "ADMIN" })
                else listOf(GrantedAuthority { "USER" })

            accessor.user = UsernamePasswordAuthenticationToken(token, null, authorities)
        }

        return message
    }
}