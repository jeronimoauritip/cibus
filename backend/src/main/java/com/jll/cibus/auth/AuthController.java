package com.jll.cibus.auth;

import com.jll.cibus.common.config.security.JwtService;
import com.jll.cibus.user.dto.UserResponseDTO;
import com.jll.cibus.user.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final JwtService jwtService;


    @PostMapping()
    public ResponseEntity<AuthResponse> authenticateUser(@RequestBody AuthRequest authRequest){
        return ResponseEntity.ok(authService.authenticate(authRequest));
    }

    @PostMapping("/refresh")
    public ResponseEntity<AuthResponse> refreshToken(@RequestBody RefreshTokenRequest request){
        AuthResponse response = authService.refreshAccessToken(request.refreshToken());
        return ResponseEntity.ok(response);
    }

    @GetMapping()
    public ResponseEntity<UserResponseDTO> getAuthenticatedUser(){
        return ResponseEntity.ok(authService.getAuthenticatedUserDTO());
    }

}
