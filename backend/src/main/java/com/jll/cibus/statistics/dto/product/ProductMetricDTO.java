package com.jll.cibus.statistics.dto.product;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductMetricDTO {
    private Long productId;
    private String productName;
    private BigDecimal productPrice;
    private Long timesSold;
}
