package com.jll.cibus.statistics.dto.waiter;
import lombok.*;

import java.util.List;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class WaiterInsightDTO {
    private List<WaiterMetricDTO> facturationRanking;
    private List<WaiterMetricDTO> ordersQuantityRanking;
    private Double averageOrdersPerWaiter;
}
