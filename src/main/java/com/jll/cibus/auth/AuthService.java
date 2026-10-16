package com.jll.cibus.auth;

import com.jll.cibus.user.entity.UserEntity;

public interface AuthService {
    AuthResponse authenticate(AuthRequest input);
    AuthResponse refreshAccessToken(String refreshToken);
    UserEntity getAuthenticatedUser();
    void authenticateUserBelongsInBranch(Long branchId);
}