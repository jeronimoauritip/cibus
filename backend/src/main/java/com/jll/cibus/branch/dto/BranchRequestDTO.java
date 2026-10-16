package com.jll.cibus.branch.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor

public class BranchRequestDTO
{
    @NotBlank (message = "Name is mandatory")
    private String name;

    @NotBlank (message = "Street is mandatory")
    private String street;

    @NotNull(message = "Number is mandatory")
    @Min(value = 10, message = "Number must have at least 2 digits")
    @Max(value = 9999, message = "Number must have at most 4 digits")
    private Integer number;

}
