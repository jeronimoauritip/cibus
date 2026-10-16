package com.jll.cibus.user.service;

import com.jll.cibus.user.dto.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface UserService {
    Page<UserResponseDTO> findAll(Pageable pageable, Long dni, String name, String email, String phoneNumber, Long branchId, Long userRoleId);
    UserResponseDTO findById(Long id);
    boolean existsByDni(Long dni);
    boolean existsById(Long id);
    boolean existsByDniAndBranch(Long dni, Long branchId);
    UserResponseDTO create(UserRequestDTO requestDTO);
    UserResponseDTO update(Long id, UserUpdateDTO updateDTO);
    UserResponseDTO changeRole(Long userId, ChangeRoleDTO updateDTO);
    UserResponseDTO changePassword(Long userId, ChangePasswordRequestDTO request);
    UserResponseDTO resetPin(Long userId, String newPin);
    void delete(Long id);
    List<String> getUserRoles();
}