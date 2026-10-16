package com.jll.cibus.statistics.dto.order;
import lombok.*;

import java.math.BigDecimal;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class OrderInsightDTO {
    private BigDecimal totalRevenue;
    private BigDecimal averageTicket;
    private BigDecimal averageRevenuePerDay;
    private OrderMetricDTO highestValueOrder;
    private OrderMetricDTO lowestValueOrder;
    private Long totalOrders;
}
