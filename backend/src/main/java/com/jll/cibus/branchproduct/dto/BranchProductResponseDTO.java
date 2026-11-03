package com.jll.cibus.branchproduct.dto;

import com.jll.cibus.product.dto.ProductResponseDTO;
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
    private ProductResponseDTO product;

}
