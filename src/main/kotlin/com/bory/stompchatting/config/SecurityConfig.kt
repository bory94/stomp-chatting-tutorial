package com.bory.stompchatting.config

import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpStatus
import org.springframework.security.config.annotation.web.builders.HttpSecurity
import org.springframework.security.config.http.SessionCreationPolicy
import org.springframework.security.web.SecurityFilterChain

/**
 * https://stackoverflow.com/questions/45405332/websocket-authentication-and-authorization-in-spring
 * https://tjdans.tistory.com/25
 */
@Configuration
class SecurityConfig(
) {

    @Bean
    fun websocketSecurity(http: HttpSecurity): SecurityFilterChain =
        http.csrf().disable()
            .headers().frameOptions().disable()
            .httpStrictTransportSecurity().disable()
            .and()
            .formLogin().disable()
            .httpBasic().disable()
            .exceptionHandling()
            .authenticationEntryPoint { _, response, _ ->
                response.status = HttpStatus.UNAUTHORIZED.value()
            }
            .accessDeniedHandler { _, response, _ ->
                response.status = HttpStatus.FORBIDDEN.value()
            }
            .and()
            .sessionManagement().sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            .and()
            .authorizeRequests()
            .anyRequest().permitAll()
            .and()
            .build()
}