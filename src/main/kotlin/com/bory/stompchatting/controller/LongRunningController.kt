package com.bory.stompchatting.controller

import com.bory.stompchatting.service.LongRunningService
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.util.*

@RestController
@RequestMapping("/v1/public/long-running")
class LongRunningController(
    private val longRunningService: LongRunningService
) {
    @PostMapping
    fun longRunning(): WebSocketResponse = WebSocketResponse(longRunningService.longRunningSync())

    @PostMapping("/async")
    fun longRunningAsync(@RequestBody tokenRequest: TokenRequest): WebSocketResponse {
        longRunningService.longRunningAsync(tokenRequest.token)

        return WebSocketResponse("Long Running Process ACCEPTED")
    }
}

data class TokenRequest(val token: String)