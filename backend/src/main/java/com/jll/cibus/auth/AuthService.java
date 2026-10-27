package com.jll.cibus.auth;

import com.jll.cibus.user.dto.UserResponseDTO;
import com.jll.cibus.user.entity.UserEntity;

public interface AuthService {
    AuthResponse authenticate(AuthRequest input);
    AuthResponse refreshAccessToken(String refreshToken);
    UserEntity getAuthenticatedUser();
    UserResponseDTO getAuthenticatedUserDTO();
    void authenticateUserBelongsInBranch(Long branchId);
}