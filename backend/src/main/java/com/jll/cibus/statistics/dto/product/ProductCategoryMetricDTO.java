package com.jll.cibus.statistics.dto.product;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductCategoryMetricDTO {
    private String name;
    private Long timesSold;
}
