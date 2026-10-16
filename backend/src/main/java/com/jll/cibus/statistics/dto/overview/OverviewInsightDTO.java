package com.jll.cibus.statistics.dto.overview;

import com.jll.cibus.statistics.dto.product.ProductCategoryMetricDTO;
import com.jll.cibus.statistics.dto.product.ProductMetricDTO;
import com.jll.cibus.statistics.dto.waiter.WaiterMetricDTO;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OverviewInsightDTO {
    private BigDecimal totalRevenue;
    private Long totalOrders;
    private Double occupancyRate;
    private ProductMetricDTO mostPopularProduct;
    private ProductCategoryMetricDTO mostPopularCategory;
    private WaiterMetricDTO bestWaiter;
}
