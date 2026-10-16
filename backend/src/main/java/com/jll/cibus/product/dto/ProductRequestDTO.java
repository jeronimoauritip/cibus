package com.jll.cibus.product.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name can't be longer than 100 characters")
    private String name;

    @Size(max = 255, message = "Description too long")
    private String description;

    @NotNull(message = "Category is required")
    private Long categoryId;
}
