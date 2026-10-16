package com.jll.cibus.user.dto;

import jakarta.validation.constraints.*;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserRequestDTO {

    @NotNull(message = "DNI is mandatory")
    @Min(value = 1_000_000, message = "Ivalid DNI")
    @Max(value = 99_999_999, message = "Invalid DNI")
    private Long dni;

    @NotBlank (message = "First name is mandatory")
    @Size(min = 2, max = 50, message = "First name must have between 2 & 50 characters")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s'-]+$", message = "Invalid characters")
    private String firstName;

    @NotBlank (message = "Last name is mandatory")
    @Size(min = 2, max = 50, message = "Last name must have between 2 & 50 characters")
    @Pattern(regexp = "^[A-Za-zÁÉÍÓÚáéíóúÑñ\\s'-]+$", message = "Invalid characters")
    private String lastName;

    @NotBlank (message = "Phone number is mandatory")
    @Pattern(regexp = "^\\+?[0-9\\s\\-()]{7,20}$", message = "Invalid phone number")
    private String phoneNumber;

    @NotBlank(message = "Email is mandatory")
    @Email(message = "Invalid format")
    private String email;

    @Positive
    private Long branchId;

    @NotNull(message = "Role is mandatory")
    private String role;

    @NotBlank (message = "PIN is mandatory")
    @Pattern(regexp = "^[0-9]{4}$", message = "PIN must be exactly 4 digits" )
    private String pin;

}
