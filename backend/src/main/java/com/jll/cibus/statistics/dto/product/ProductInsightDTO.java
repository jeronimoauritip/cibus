package com.jll.cibus.statistics.dto.product;
import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class ProductInsightDTO {
    private ProductMetricDTO mostPopularProduct;
    private ProductMetricDTO lessPopularProduct;
    private ProductMetricDTO mostExpensiveProduct;
    private ProductMetricDTO cheapestProduct;
    private ProductCategoryMetricDTO mostPopularCategory;
    private ProductCategoryMetricDTO lessPopularCategory;
}
