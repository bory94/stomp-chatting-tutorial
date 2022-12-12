package com.bory.stompchatting.controller

import org.springframework.security.authentication.BadCredentialsException
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping("/v1/public/login")
class LoginController {
    @PostMapping
    fun login(@RequestBody authInfo: AuthInfo) = LoginResult(authInfo.generateToken())
}

data class LoginResult(val token: String)

data class AuthInfo(
    val username: String,
    val password: String
) {
    companion object {
        fun parseToken(token: String): AuthInfo {
            val split = token.split("!@")
            if (split.size != 3) throw BadCredentialsException("Invalid Token")

            return AuthInfo(split[1], split[2])
        }
    }

    fun generateToken() = "T!@$username!@$password"
}