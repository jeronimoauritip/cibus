package com.jll.cibus.branchproduct.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class BranchProductResponseDTO {

    private Long id;

    private Boolean available;

    private BigDecimal price;

    private Long branchId;

    private String branchName;

    private Long productId;

    private String productName;

}
