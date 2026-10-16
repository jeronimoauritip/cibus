package com.jll.cibus.user.controller;

import com.jll.cibus.user.dto.*;
import com.jll.cibus.user.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RequiredArgsConstructor
@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    @GetMapping
    public ResponseEntity<Page<UserResponseDTO>> getAll (Pageable pageable,
                                                         @RequestParam(required = false) Long dni,
                                                         @RequestParam(required = false) String name,
                                                         @RequestParam(required = false) String phoneNumber,
                                                         @RequestParam(required = false) String email,
                                                         @RequestParam(required = false) Long branchId,
                                                         @RequestParam(required = false) Long userRoleId) {

        return ResponseEntity.ok(userService.findAll(pageable, dni, name, email, phoneNumber, branchId, userRoleId));
    }

    @GetMapping("/{userId}")
    public ResponseEntity<UserResponseDTO> getById (@PathVariable Long userId) {

        return ResponseEntity.ok(userService.findById(userId));
    }

    @PostMapping ()
    public ResponseEntity<UserResponseDTO> create (@Valid @RequestBody UserRequestDTO request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(userService.create(request));
    }

    @PutMapping("/{userId}/change-password")
    public ResponseEntity<UserResponseDTO> changePassword(@PathVariable Long userId, @Valid @RequestBody ChangePasswordRequestDTO request){
        return ResponseEntity.ok(userService.changePassword(userId, request));
    }

    @PatchMapping ("/{userId}/reset-pin")
    public ResponseEntity<UserResponseDTO> resetPin (@PathVariable Long userId, @Valid @RequestBody ResetPinRequestDTO request) {
        return ResponseEntity.ok(userService.resetPin(userId,request.getNewPin()));
    }

    @PutMapping("/{userId}/change-role")
    public ResponseEntity<UserResponseDTO> changeRole(@PathVariable Long userId, @Valid @RequestBody ChangeRoleDTO request){
        return ResponseEntity.ok(userService.changeRole(userId, request));
    }

    @PutMapping ("/{userId}")
    public ResponseEntity<UserResponseDTO> update (@PathVariable Long userId, @Valid @RequestBody UserUpdateDTO dto) {

        return ResponseEntity.ok(userService.update(userId, dto));
    }

    @DeleteMapping("/{userId}")
    public ResponseEntity<Void> delete (@PathVariable Long userId) {
        userService.delete(userId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/roles")
    public ResponseEntity<List<String>> getRoles(){
        return ResponseEntity.ok(userService.getUserRoles());
    }

}
