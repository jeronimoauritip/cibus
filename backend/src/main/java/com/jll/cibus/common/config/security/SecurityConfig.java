package com.jll.cibus.common.config.security;

import com.jll.cibus.auth.RestAuthenticationEntryPoint;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import static org.springframework.security.config.http.SessionCreationPolicy.STATELESS;

@Configuration
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RestAuthenticationEntryPoint restAuthenticationEntryPoint;
    private final PasswordEncoder passwordEncoder;


    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config)
            throws Exception {
        return config.getAuthenticationManager();
    }


    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws
            Exception {
        http.authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll()
                        // Users
                        .requestMatchers(HttpMethod.GET, "/api/users/**").hasAuthority("USER_READ")
                        .requestMatchers(HttpMethod.PUT, "/api/users/**").hasAuthority("USER_UPDATE")
                        .requestMatchers(HttpMethod.PATCH, "/api/users/**").hasAuthority("USER_UPDATE")
                        .requestMatchers("/api/users/**").hasRole("ADMIN")
                        // Tables
                        .requestMatchers(HttpMethod.GET, "/api/branches/*/tables/**").hasAuthority("TABLE_READ")
                        .requestMatchers(HttpMethod.POST, "/api/branches/*/tables/**").hasAuthority("TABLE_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/branches/*/tables/**").hasAuthority("TABLE_UPDATE")
                        .requestMatchers(HttpMethod.PATCH, "/api/branches/*/tables/**").hasAnyAuthority("TABLE_OPEN", "TABLE_CLOSE")
                        .requestMatchers(HttpMethod.DELETE, "/api/branches/*/tables/**").hasAuthority("TABLE_DELETE")
                        // Orders
                        .requestMatchers(HttpMethod.DELETE, "/api/branches/*/orders/*/items/**").hasAuthority("ORDER_CANCEL")
                        .requestMatchers(HttpMethod.POST, "/api/branches/*/orders/*/ready",
                                                                    "/api/branches/*/orders/*/serve") .hasAuthority("ORDER_CHANGE_STATUS")
                        .requestMatchers(HttpMethod.POST, "/api/branches/*/orders/*/cancel").hasAuthority("ORDER_CANCEL")
                        .requestMatchers(HttpMethod.GET, "/api/branches/*/orders/**").hasAuthority("ORDER_READ")
                        .requestMatchers(HttpMethod.POST, "/api/branches/*/orders/**").hasAuthority("ORDER_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/branches/*/orders/**").hasAuthority("ORDER_UPDATE")
                        .requestMatchers(HttpMethod.PATCH, "/api/branches/*/orders/**").hasAuthority("ORDER_UPDATE")
                        // Products por branch
                        .requestMatchers(HttpMethod.GET, "/api/branches/*/products/**").hasAuthority("BRANCH_PRODUCT_READ")
                        .requestMatchers(HttpMethod.POST, "/api/branches/*/products/**").hasAuthority("BRANCH_PRODUCT_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/branches/*/products/**").hasAuthority("BRANCH_PRODUCT_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/branches/*/products/**").hasAnyRole("ADMIN", "MANAGER")
                        // Branches
                        .requestMatchers(HttpMethod.GET, "/api/branches/**").hasAuthority("BRANCH_READ")
                        .requestMatchers(HttpMethod.POST, "/api/branches/**").hasAuthority("BRANCH_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/branches/**").hasAuthority("BRANCH_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/branches/**").hasRole("ADMIN")
                        // Products (globales)
                        .requestMatchers(HttpMethod.GET, "/api/products/**").hasAuthority("PRODUCT_READ")
                        .requestMatchers(HttpMethod.POST, "/api/products/**").hasAuthority("PRODUCT_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("PRODUCT_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/products/**").hasRole("ADMIN")
                        // Categories
                        .requestMatchers(HttpMethod.GET, "/api/product-categories/**").hasAuthority("CATEGORY_READ")
                        .requestMatchers(HttpMethod.POST, "/api/product-categories/**").hasAuthority("CATEGORY_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/product-categories/**").hasAuthority("CATEGORY_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/product-categories/**").hasRole("ADMIN")
                        // Payment methods
                        .requestMatchers(HttpMethod.GET, "/api/payment-methods/**").hasAuthority("PAYMENT_READ")
                        .requestMatchers(HttpMethod.POST, "/api/payment-methods/**").hasAuthority("PAYMENT_CREATE")
                        .requestMatchers(HttpMethod.PUT, "/api/payment-methods/**").hasAuthority("PAYMENT_UPDATE")
                        .requestMatchers(HttpMethod.DELETE, "/api/payment-methods/**").hasRole("ADMIN")
                        // Statistics
                        .requestMatchers("/api/statistics/global/**").hasRole("ADMIN")
                        .requestMatchers("/api/statistics/branch/**").hasAnyRole("ADMIN", "MANAGER")
                        // Swagger OpenAPI Specification
                        .requestMatchers("/v3/api-docs/**").permitAll()
                        .requestMatchers("/swagger-ui/**").permitAll()
                        .requestMatchers("/swagger-ui.html").permitAll()
                        .requestMatchers("/openapi.yaml").permitAll()


                        .anyRequest().authenticated()
                )
                .cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .headers(headers
                        -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin)
                )
                .sessionManagement(manager ->
                        manager.sessionCreationPolicy(STATELESS))
                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(e ->
                        e.authenticationEntryPoint(restAuthenticationEntryPoint)
                                .accessDeniedHandler(accessDeniedHandler()));
        return http.build();
    }
    @Bean
    public AccessDeniedHandler accessDeniedHandler() {
        return (request, response, ex) -> {
            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
            response.setContentType("application/json");
            response.getWriter().write(String.format(
                    "{\"error\":\"You do not have permission to perform this operation\", \"status\": %d, \"path\": \"%s\"}",
                    HttpServletResponse.SC_FORBIDDEN,
                    request.getRequestURI()));
            response.getWriter().flush();
        };
    }


}

