package com.jll.cibus.branchproduct.dto;

import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchProductUpdateDTO {

    @Positive
    private BigDecimal price;

    private Boolean available;
}
