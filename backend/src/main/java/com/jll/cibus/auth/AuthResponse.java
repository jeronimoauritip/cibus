package com.jll.cibus.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AuthResponse(
        @JsonProperty("accessToken") String accessToken,
        @JsonProperty("refreshToken") String refreshToken
) {
    @JsonProperty("AccessToken")
    public String AccessToken() {
        return accessToken;
    }
}

