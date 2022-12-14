package com.bory.stompchatting.service

import com.bory.stompchatting.controller.WebSocketResponse
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.messaging.simp.SimpMessagingTemplate
import org.springframework.scheduling.annotation.Async
import org.springframework.stereotype.Service

@Service
class LongRunningService(
    private val messagingTemplate: SimpMessagingTemplate
) {
    companion object {
        private val LOGGER: Logger = LoggerFactory.getLogger(LongRunningService::class.java)
    }

    fun longRunningSync(): String {
        LOGGER.debug("LONG Running Process Started...")

        Thread.sleep(3000)

        LOGGER.debug("LONG Running Process Finished...")

        return "Long Running SYNC Process Finished"
    }

    @Async
    fun longRunningAsync(token: String, subscription: String) {
        LOGGER.debug("ASYNC LONG Running Process Started...")

        Thread.sleep(3000)

        LOGGER.debug("ASYNC LONG Running Process Finished...")

        messagingTemplate.convertAndSendToUser(
            token,
            subscription,
            WebSocketResponse("Long Running ASYNC Process Completed.")
        )
    }
}