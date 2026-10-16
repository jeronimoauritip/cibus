package com.jll.cibus.productcategory.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class ProductCategoryRequestDTO {

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name can't be longer than 100 characters")
    private String name;
}
