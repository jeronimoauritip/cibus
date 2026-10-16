package com.jll.cibus.branchproduct.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchProductRequestDTO {

    @NotNull
    private Long productId;

    @NotNull
    @Positive
    private BigDecimal price;

}
