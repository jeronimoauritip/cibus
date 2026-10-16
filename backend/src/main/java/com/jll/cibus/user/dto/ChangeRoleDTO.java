package com.jll.cibus.user.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ChangeRoleDTO {

    @NotBlank(message = "Role name is mandatory")
    private String roleName;

    @Pattern(regexp = "^[0-9]{4}$", message = "PIN must be exactly 4 digits")
    private String newPin;

}
