package com.jll.cibus.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserUpdateDTO {

    @Min(value = 1_000_000, message = "Ivalid DNI")
    @Max(value = 99_999_999, message = "Invalid DNI")
    private Long dni;


    @Size(min = 2, max = 50, message = "First name must have between 2 & 50 characters")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s'-]+$", message = "Invalid characters")
    private String firstName;


    @Size(min = 2, max = 50, message = "Last name must have between 2 & 50 characters")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s'-]+$", message = "Invalid characters")
    private String lastName;


    @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number")
    private String phoneNumber;


    @Email(message = "Invalid format")
    private String email;


    @Positive
    private Long branchId;

}
