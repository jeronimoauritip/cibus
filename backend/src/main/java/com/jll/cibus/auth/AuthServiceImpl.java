package com.jll.cibus.auth;

import com.jll.cibus.common.config.security.JwtService;
import com.jll.cibus.common.exception.ForbiddenOperationException;
import com.jll.cibus.common.exception.InvalidCredentialsException;
import com.jll.cibus.common.exception.ResourceNotFoundException;
import com.jll.cibus.common.exception.UnauthorizedOperationException;
import com.jll.cibus.credential.entity.CredentialsEntity;
import com.jll.cibus.credential.repository.CredentialsRepository;
import com.jll.cibus.role.enums.Roles;
import com.jll.cibus.user.dto.UserResponseDTO;
import com.jll.cibus.user.entity.UserEntity;
import com.jll.cibus.user.mapper.UserMapper;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final CredentialsRepository credentialsRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final UserMapper userMapper;


    @Override
    public AuthResponse authenticate(AuthRequest input) {
        authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(input.getUsername(), input.getPassword()));
        CredentialsEntity user = credentialsRepository.findByUsername(input.getUsername())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(refreshToken);
        credentialsRepository.save(user);
        return new AuthResponse(accessToken, refreshToken);
    }

    @Override
    @Transactional
    public AuthResponse refreshAccessToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        CredentialsEntity user = credentialsRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        if (!user.getRefreshToken().equals(refreshToken)) {
            throw new InvalidCredentialsException();
        }
        if (!jwtService.validateRefreshToken(refreshToken, user)) {
            throw new InvalidCredentialsException();
        }
        String newAccessToken = jwtService.generateToken(user);
        String newRefreshToken = jwtService.generateRefreshToken(user);
        user.setRefreshToken(newRefreshToken);
        credentialsRepository.save(user);
        return new AuthResponse(newAccessToken, newRefreshToken);
    }

    @Override
    public UserEntity getAuthenticatedUser(){
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new UnauthorizedOperationException("User not authenticated");
        }
        Object principal = authentication.getPrincipal();
        String username;
        if (principal instanceof UserDetails) {
            username = ((UserDetails) principal).getUsername();
        } else {
            username = principal.toString();
        }
        if ("anonymousUser".equals(username)) {
            throw new UnauthorizedOperationException("Invalid token");
        }
        CredentialsEntity credentials = credentialsRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("Credentials not found"));
        UserEntity user = credentials.getUser();
        if(user == null){
            throw new ResourceNotFoundException("There is no user related to credentials");
        }
        return user;
    }

    @Override
    public UserResponseDTO getAuthenticatedUserDTO(){
        return userMapper.toDTO(getAuthenticatedUser());
    }

    @Override
    public void authenticateUserBelongsInBranch(Long branchId){
        if(branchId == null){
            throw new ForbiddenOperationException("branch ID is mandatory");
        }
        UserEntity user = getAuthenticatedUser();
        if(user.getRole().getRole() != Roles.ADMIN){
            if(user.getBranch() == null){
                throw new ForbiddenOperationException("User has no branch assigned");
            }
            if(!user.getBranch().getId().equals(branchId)){
                throw new ForbiddenOperationException("User assigned to a different branch");
            }
        }
    }


}
