package com.bory.stompchatting.controller

import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.messaging.handler.annotation.MessageMapping
import org.springframework.messaging.handler.annotation.SendTo
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.messaging.simp.annotation.SendToUser
import org.springframework.stereotype.Controller
import java.security.Principal

@Controller
class MessagingController(
    private val messaging: SimpMessagingTemplate
) {
    companion object {
        private val LOGGER: Logger = LoggerFactory.getLogger(MessagingController::class.java)
    }

    @MessageMapping("/message")
    @SendTo("/topic/broadcasted-message")
    fun send(principal: Principal, message: String): String {
        LOGGER.debug("SENDING!!!! ::: $principal ::: $message")
        val authInfo = AuthInfo.parseToken(principal.name)
        return "${message.uppercase()} by ${authInfo.username}"
    }

    @MessageMapping("/notification")
    @SendToUser("/queue/notification")
    fun notification(principal: Principal, message: String): String {
        LOGGER.debug("NOTIFICATION!!!! ::: $principal ::: $message")
        val authInfo = AuthInfo.parseToken(principal.name)
        messaging.convertAndSendToUser(
            "admin",
            "/queue/notification",
            "TO SPECIFIC USER ::: $message"
        )
        return "$message from ${authInfo.username}"
    }
}